import {initializeEmpty} from "./lexical-editor";
import { InitialEditorStateType } from '@lexical/react/LexicalComposer';
import {LexicalEditor} from "lexical";
import {
    htmlToEditorStateStr,
    markdownToEditorStateStr,
    normalizeMarkdown
} from "./markdown-transforms";
import {decompress} from "@/utils/compression";
import { ArticleEmbed } from "@/lex-api/types/ar/cabildoabierto/feed/article";


export function getInitialData(text: string, format: string, shouldPreserveNewLines: boolean = false, embeds?: ArticleEmbed[]): InitialEditorStateType {

    if(format == "markdown"){
        text = normalizeMarkdown(text, true)
        const state = markdownToEditorStateStr(text, shouldPreserveNewLines, true, embeds ?? [])
        const parsedState = JSON.parse(state)
        if(parsedState.root.children.length == 0){
            return initializeEmpty("")
        }
        return getInitialData(state, "lexical", shouldPreserveNewLines, embeds)
    } else if(format == "markdown-compressed") {
        return getInitialData(decompress(text), "markdown", shouldPreserveNewLines, embeds)
    } else if(format == "lexical"){
        return (editor: LexicalEditor) => {
            editor.update(() => {
                const parsed = editor.parseEditorState(text)
                editor.setEditorState(parsed)
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