import {createHeadlessEditor} from "@lexical/headless"
import {$convertFromMarkdownString, $convertToMarkdownString} from "@lexical/markdown"
import {CA_TRANSFORMERS} from "./ca-transformers";
import {getEditorNodes} from "./nodes/get-editor-nodes";
import {decompress} from "@/utils/compression";
import {$insertNodes} from "lexical";
import {$generateNodesFromDOM} from "@lexical/html";
import {$dfs} from "@lexical/utils";
import {$isSidenoteNode} from "./nodes/SidenoteNode";


export function editorStateToMarkdown(s: string) {
    const nodes = getEditorNodes({allowImages: true})

    const editor = createHeadlessEditor({
        nodes,
        onError: () => {
        },
    })

    const parsed = editor.parseEditorState(s)

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
            for(let j = 1; j < children.length; j++){
                node = node.insertAfter(children[j])
            }
            s.remove()
        }
    }, {discrete: true})

    let markdown: string
    editor.read(() => {
        markdown = $convertToMarkdownString(CA_TRANSFORMERS, undefined, true)
    })

    return markdown
}


export function markdownToEditorState(markdown: string, shouldPreserveNewLines: boolean = false): any {
    return JSON.parse(markdownToEditorStateStr(markdown, shouldPreserveNewLines))
}


export function markdownToEditorStateStr(markdown: string, shouldPreserveNewLines: boolean = false): string {
    const nodes = getEditorNodes({allowImages: true})

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
            true)
    })

    const editorState = editor.read(() => {
        return editor.getEditorState()
    })
    return JSON.stringify(JSON.parse(JSON.stringify(editorState.toJSON())))
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


export function anyEditorStateToMarkdown(text: string, format: string): string {
    if (format == "markdown") {
        return text
    } else if (format == "lexical") {
        return editorStateToMarkdown(text)
    } else if (format == "lexical-compressed") {
        return anyEditorStateToMarkdown(decompress(text), "lexical")
    } else if (format == "markdown-compressed") {
        return decompress(text)
    } else if (format == "html") {
        return anyEditorStateToMarkdown(htmlToEditorStateStr(text), "lexical")
    } else if (format == "html-compressed") {
        return anyEditorStateToMarkdown(decompress(text), "html")
    } else if (!format) {
        console.log("Sin formato, asumiendo lexical-compressed")
        console.log("text", text)
        return anyEditorStateToMarkdown(text, "lexical-compressed")
    } else {
        throw Error("Formato de contenido desconocido: " + format)
    }
}