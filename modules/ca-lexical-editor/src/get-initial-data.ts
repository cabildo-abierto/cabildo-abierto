import {initializeEmpty} from "./lexical-editor";
import { InitialEditorStateType } from '@lexical/react/LexicalComposer';
import {LexicalEditor} from "lexical";
import {
    htmlToEditorStateStr, markdownToEditorState,
    normalizeMarkdown
} from "./markdown-transforms";
import {decompress} from "@/utils/compression";
import {ArticleEmbedView} from "@/lex-api/types/ar/cabildoabierto/feed/article";
import {SerializedCustomLinkNode} from "./nodes/CustomLinkNode";
import {SerializedTopicMentionNode} from "./nodes/TopicMentionNode";


export function isTopicUrl(url: string): boolean {
    return url.startsWith("/tema?")
        || url.startsWith("https://cabildoabierto.ar/tema?")
        || url.startsWith("https://cabildoabierto.com.ar/tema?")
        || url.startsWith("https://www.cabildoabierto.ar/tema?")
        || url.startsWith("https://www.cabildoabierto.com.ar/tema?")
}


function createTopicMentionsFromNode(node: any){
    if(node.type == "custom-link"){

        const linkNode: SerializedCustomLinkNode = node as SerializedCustomLinkNode;
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



export function getInitialData(
    text: string,
    format: string,
    shouldPreserveNewLines: boolean = false,
    embeds?: ArticleEmbedView[],
    topicMentions: boolean = true
): InitialEditorStateType {

    if(format == "markdown"){
        text = normalizeMarkdown(text, true)
        const state = markdownToEditorState(
            text, shouldPreserveNewLines, true, embeds ?? []
        )
        if(state.root.children.length == 0){
            return initializeEmpty("")
        }
        return getInitialData(JSON.stringify(state), "lexical", shouldPreserveNewLines, embeds)
    } else if(format == "markdown-compressed") {
        return getInitialData(decompress(text), "markdown", shouldPreserveNewLines, embeds)
    } else if(format == "lexical"){
        return (editor: LexicalEditor) => {
            editor.update(() => {
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
            })
        }
    } else if(format == "lexical-compressed" || !format) {
        return getInitialData(decompress(text), "lexical", shouldPreserveNewLines, embeds)
    } else if(format == "html"){
        const state = htmlToEditorStateStr(text)
        return getInitialData(state, "lexical", shouldPreserveNewLines, embeds)
    } else if(format == "html-compressed") {
        return getInitialData(decompress(text), "html", shouldPreserveNewLines, embeds)
    } else if(format == "plain-text"){
        return initializeEmpty(text)
    } else {
        throw("Formato de contenido desconocido: "+format)
    }
}