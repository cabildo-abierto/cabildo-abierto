import {InitialEditorStateType} from '@lexical/react/LexicalComposer';
import {$createParagraphNode, $createTextNode, $getRoot, EditorState} from "lexical";
import {
    htmlToEditorStateStr, markdownToEditorState,
    normalizeMarkdown
} from "./markdown-transforms";
import {ArCabildoabiertoFeedArticle} from "@cabildo-abierto/api/dist"
import {SerializedTopicMentionNode} from "./nodes/TopicMentionNode";
import {CA_TRANSFORMERS, MarkdownTransformer} from "@/components/editor/markdown-transformers/ca-transformers";
import {
    LexicalEditor as OriginalLexicalEditor
} from 'lexical';
import {SerializedLinkNode} from "@lexical/link";
import { decompress } from "@cabildo-abierto/editor-core";

export function isTopicUrl(url: string): boolean {
    return url.startsWith("/tema?")
        || url.startsWith("https://cabildoabierto.ar/tema?")
        || url.startsWith("https://cabildoabierto.com.ar/tema?")
        || url.startsWith("https://www.cabildoabierto.ar/tema?")
        || url.startsWith("https://www.cabildoabierto.com.ar/tema?")
}


function createTopicMentionsFromNode(node: any){
    if(node.type == "link"){
        const linkNode = node as SerializedLinkNode;
        const url = linkNode.url
        if(isTopicUrl(url)){
            const topicMention: SerializedTopicMentionNode = {
                type: "topic-mention",
                url: url,
                version: node.version
            }
            return topicMention
        }
    } else if(node.children){
        for(let i = 0; i < node.children.length; i++){
            let c = node.children[i]
            c = createTopicMentionsFromNode(c)
            node.children[i] = c
        }
    }
    return node
}


function createTopicMentions(lexicalStr: string){
    const state = JSON.parse(lexicalStr)
    let root = state.root
    root = createTopicMentionsFromNode(root)
    state.root = root
    return JSON.stringify(state)
}


export const initializeEmpty = (initialText: string) => (editor: OriginalLexicalEditor) => {
    editor.update(() => {
        const root = $getRoot()
        const node = $createParagraphNode()
        node.append($createTextNode(initialText))
        root.append(node)
    })
}


export function getInitialData(
    text: string | EditorState,
    format: string,
    shouldPreserveNewLines: boolean = false,
    embeds?: ArCabildoabiertoFeedArticle.ArticleEmbedView[],
    topicMentions: boolean = false,
    transformers: MarkdownTransformer[] = CA_TRANSFORMERS
): InitialEditorStateType {
    if(typeof text != "string"){
        return text
    }
    if(format == "markdown"){
        text = normalizeMarkdown(text, true)
        const state = markdownToEditorState(
            text,
            shouldPreserveNewLines,
            true,
            embeds ?? [],
            undefined,
            transformers
        )
        if(state.root.children.length == 0){
            return initializeEmpty("")
        }
        return getInitialData(
            JSON.stringify(state),
            "lexical",
            shouldPreserveNewLines,
            embeds,
            topicMentions
        )
    } else if(format == "markdown-compressed") {
        return getInitialData(
            decompress(text),
            "markdown",
            shouldPreserveNewLines,
            embeds,
            topicMentions,
            transformers
        )
    } else if(format == "lexical"){
        return (editor: OriginalLexicalEditor) => {
            editor.update(() => {
                if(typeof text == "string") {
                    try {
                        if(topicMentions){
                            text = createTopicMentions(text)
                        }
                        const parsed = editor.parseEditorState(text)
                        editor.setEditorState(parsed)
                    } catch (e) {
                        console.log("Error", e)
                        console.log("Text", text)
                    }
                }
            })
        }
    } else if(format == "lexical-compressed" || !format) {
        return getInitialData(
            decompress(text),
            "lexical",
            shouldPreserveNewLines,
            embeds,
            topicMentions,
            transformers
        )
    } else if(format == "html"){
        const state = htmlToEditorStateStr(text)
        return getInitialData(
            state,
            "lexical",
            shouldPreserveNewLines,
            embeds,
            topicMentions,
            transformers
        )
    } else if(format == "html-compressed") {
        return getInitialData(
            decompress(text),
            "html",
            shouldPreserveNewLines,
            embeds,
            topicMentions,
            transformers
        )
    } else if(format == "plain-text"){
        return initializeEmpty(text)
    } else {
        throw("Formato de contenido desconocido: "+format)
    }
}