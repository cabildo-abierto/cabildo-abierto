import {createHeadlessEditor} from "@lexical/headless"
import {$convertFromMarkdownString, $convertToMarkdownString} from "@lexical/markdown"
import {CA_TRANSFORMERS} from "./ca-transformers";
import {getEditorNodes} from "./nodes/get-editor-nodes";
import {decompress} from "@/utils/compression";
import {
    $createParagraphNode,
    $getRoot,
    $insertNodes,
    $isParagraphNode,
    $isTextNode,
    LexicalNode, SerializedEditorState
} from "lexical";
import {$generateNodesFromDOM} from "@lexical/html";
import {$dfs} from "@lexical/utils";
import {$isSidenoteNode} from "./nodes/SidenoteNode";
import {ArticleEmbedView} from "@/lex-api/types/ar/cabildoabierto/feed/article";
import {Main as Visualization} from "@/lex-api/types/ar/cabildoabierto/embed/visualization";
import {EmbedContext, SerializedEmbedNode} from "./nodes/EmbedNode";
import {LexicalPointer} from "./selection/lexical-selection";
import {ProcessedLexicalState} from "./selection/processed-lexical-state";
import {View as ImagesEmbedView} from "@/lex-api/types/app/bsky/embed/images"


export function editorStateToMarkdownNoEmbeds(state: ProcessedLexicalState | SerializedEditorState | string) {
    state = ProcessedLexicalState.fromMaybeProcessed(state)
    const nodes = getEditorNodes({allowImages: true})

    const editor = createHeadlessEditor({
        nodes,
        onError: () => {
        },
    })

    const parsed = editor.parseEditorState(state.state)

    editor.update(() => {
        editor.setEditorState(parsed)
    }, {discrete: true})

    editor.update(() => {
        // eliminamos las sidenotes para que no modifiquen el markdown
        const sidenotes = $dfs().map(n => n.node).filter($isSidenoteNode)
        for (let i = 0; i < sidenotes.length; i++) {
            const s = sidenotes[i]
            const children = s.getChildren()
            let node = s.insertAfter(children[0])
            for (let j = 1; j < children.length; j++) {
                node = node.insertAfter(children[j])
            }
            s.remove()
        }
    }, {discrete: true})

    let markdown: string
    editor.read(() => {
        markdown = $convertToMarkdownString(CA_TRANSFORMERS, undefined, true)
    })

    return normalizeMarkdown(markdown)
}


export function normalizeMarkdown(markdown: string, ensureIdempotent: boolean = false) {
    markdown = markdown.replace(/^\n+|\n+$/g, '')

    markdown = markdown.replace(/\n{3,}/g, '\n\n')

    markdown = markdown.replace(/[ \t]+\n/g, '\n')
    markdown = markdown.replace(
        /(?<!\n)(?<![-*+]\s|\d+\.\s|\|.*)\n(?!\n|[-*+]\s|\d+\.\s|#+\s|\|.*)/g,
        ' '
    );

    if (ensureIdempotent) {
        const s = markdownToEditorStateNoEmbeds(markdown)
        markdown = editorStateToMarkdownNoEmbeds(new ProcessedLexicalState(s))
    }

    return markdown
}


function $isEmptyParagraphNode(node: LexicalNode): boolean {
    if (!$isParagraphNode(node)) return false
    const children = node.getChildren()
    for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if ($isTextNode(child) && child.__text.trim().length > 0) {
            return false
        } else if (!$isTextNode(child)) {
            return false
        }
    }
    return true
}


function joinEditorStates(a: SerializedEditorState, b: SerializedEditorState): SerializedEditorState {
    for (let i = 0; i < b.root.children.length; i++) {
        a.root.children.push(b.root.children[i])
    }
    return a
}

/*function nodeForPrint(node: ElementOrTextNode) {
    return {
        type: node.type,
        children: "children" in node ? node.children.map(nodeForPrint) : undefined,
        text: "text" in node ? node.text : undefined,
    }
}*/


export function markdownToEditorState(
    markdown: string,
    shouldPreserveNewLines: boolean = true,
    shouldMergeAdjacentLines: boolean = true,
    embeds: ArticleEmbedView[] = [],
    embedContexts: EmbedContext[] = [],
): SerializedEditorState {
    if (embeds.length == 0) {
        return markdownToEditorStateNoEmbeds(markdown, shouldPreserveNewLines, shouldMergeAdjacentLines)
    }

    let res = null

    let lastIndex = 0
    for (let i = 0; i < embeds.length; i++) {
        const v = embeds[i].value
        const markdownSlice = markdown.slice(lastIndex, embeds[i].index)

        const s = markdownToEditorStateNoEmbeds(markdownSlice, shouldPreserveNewLines, shouldMergeAdjacentLines)

        const vNode: SerializedEmbedNode = {
            spec: JSON.stringify(v),
            context: JSON.stringify(embedContexts[i]),
            type: 'embed',
            version: 1
        }

        s.root.children.push(vNode)

        res = res ? joinEditorStates(res, s) : s

        lastIndex = embeds[i].index
    }

    res = joinEditorStates(res, markdownToEditorStateNoEmbeds(markdown.slice(lastIndex), shouldPreserveNewLines, shouldMergeAdjacentLines))

    return res
}


export function markdownToEditorStateNoEmbeds(
    markdown: string,
    shouldPreserveNewLines: boolean = true,
    shouldMergeAdjacentLines: boolean = true
): SerializedEditorState {

    const nodes = getEditorNodes({allowImages: true})

    markdown = normalizeMarkdown(markdown)

    const editor = createHeadlessEditor({
        nodes,
        onError: () => {
        },
    })

    editor.update(() => {
        $convertFromMarkdownString(
            markdown,
            CA_TRANSFORMERS,
            undefined,
            shouldPreserveNewLines,
            shouldMergeAdjacentLines)
    }, {discrete: true})

    editor.update(() => {
        // eliminamos los párrafos vacíos
        const nodes = $dfs()
        if (nodes.length == 1) return // salvo que haya un solo párrafo
        for (let i = 0; i < nodes.length; i++) {
            const n = nodes[i].node
            if ($isEmptyParagraphNode(n)) {
                n.remove()
            }
        }
    }, {discrete: true})

    editor.update(() => {
        const root = $getRoot();
        root.append($createParagraphNode());
        root.getChildren().at(-1)?.remove();
    });

    const editorState = editor.read(() => {
        return editor.getEditorState()
    })
    return editorState.toJSON()
}


export function htmlToEditorStateStr(text: string) {
    const nodes = getEditorNodes({allowImages: true})

    const editor = createHeadlessEditor({
        nodes,
        onError: () => {
        },
    })

    // Se supone que funciona en node js
    // const dom = (new JSDOM(text)).window.document;

    editor.update(() => {
        // Requiere estar en browser
        const parser = new DOMParser();
        const dom = parser.parseFromString(text, "text/html");
        const treeNodes = $generateNodesFromDOM(editor, dom);
        $insertNodes(treeNodes)
    })

    const editorState = editor.read(() => {
        return editor.getEditorState()
    })
    return JSON.stringify(JSON.parse(JSON.stringify(editorState.toJSON())))
}


export function anyEditorStateToMarkdown(text: string, format: string, embeds?: ArticleEmbedView[], embedContexts?: EmbedContext[]): {
    markdown: string,
    embeds: ArticleEmbedView[],
    embedContexts: EmbedContext[]
} {
    if (format == "markdown") {
        return {markdown: normalizeMarkdown(text, true), embeds, embedContexts}
    } else if (format == "lexical") {
        return editorStateToMarkdown(ProcessedLexicalState.fromMaybeProcessed(text))
    } else if (format == "lexical-compressed") {
        return anyEditorStateToMarkdown(decompress(text), "lexical", embeds)
    } else if (format == "markdown-compressed") {
        return anyEditorStateToMarkdown(decompress(text), "markdown", embeds)
    } else if (format == "html") {
        return anyEditorStateToMarkdown(htmlToEditorStateStr(text), "lexical", embeds)
    } else if (format == "html-compressed") {
        return anyEditorStateToMarkdown(decompress(text), "html", embeds)
    } else if (!format) {
        return anyEditorStateToMarkdown(text, "lexical-compressed", embeds)
    } else {
        throw Error("Formato de contenido desconocido: " + format)
    }
}


export function editorStateToMarkdown(state: ProcessedLexicalState | string | SerializedEditorState): { markdown: string; embeds: ArticleEmbedView[], embedContexts: EmbedContext[] } | null {
    /***
     * Transformamos el editor state a markdown
     * y buscamos los VisualizationNodes para armar la lista de embeds
     * el índice de los embeds se obtiene transformando a markdown todos los nodos anteriores
     * ***/
    state = ProcessedLexicalState.fromMaybeProcessed(state)
    const markdown = editorStateToMarkdownNoEmbeds(state);
    const embeds: ArticleEmbedView[] = [];
    const contexts: EmbedContext[] = []

    for (let i = 0; i < state.state.root.children.length; i++) {
        const node = state.state.root.children[i]
        if (node.type == "embed") {
            const vNode = node as SerializedEmbedNode
            const lexicalPointer = new LexicalPointer([i])
            const markdownUpTo = lexicalPointer.getMarkdownUpTo(state, true)
            const index = markdownUpTo.length
            if (vNode.spec) {
                const spec = JSON.parse(vNode.spec)
                if(spec.$type == "ar.cabildoabierto.embed.visualization"){
                    embeds.push({
                        $type: "ar.cabildoabierto.feed.article#articleEmbedView",
                        value: {
                            $type: "ar.cabildoabierto.embed.visualization",
                            ...(spec as Visualization)
                        },
                        index
                    })
                } else if(spec.$type == "app.bsky.embed.images#view"){
                    embeds.push({
                        $type: "ar.cabildoabierto.feed.article#articleEmbedView",
                        value: {
                            $type: "app.bsky.embed.images#view",
                            ...(spec as ImagesEmbedView)
                        },
                        index
                    })
                }
                if(vNode.context){
                    const context = JSON.parse(vNode.context) as EmbedContext
                    contexts.push(context)
                } else {
                    contexts.push(null)
                }
            }
        }
    }

    return {markdown, embeds, embedContexts: contexts}
}