import {initializeEmpty} from "./lexical-editor";
import { InitialEditorStateType } from '@lexical/react/LexicalComposer';
import {LexicalEditor} from "lexical";
import {editorStateToMarkdown, htmlToEditorStateStr, markdownToEditorStateStr} from "./markdown-transforms";
import {decompress} from "@/utils/compression";


export function getInitialData(text: string, format: string): InitialEditorStateType {
    if(!text || text.length == 0){
        return initializeEmpty("")
    }

    if(format == "markdown"){
        const state = markdownToEditorStateStr(text)
        return getInitialData(state, "lexical")
    } else if(format == "markdown-compressed") {
        return getInitialData(decompress(text), "markdown")
    } else if(format == "lexical"){
        return (editor: LexicalEditor) => {
            editor.update(() => {
                const parsed = editor.parseEditorState(text)
                editor.setEditorState(parsed)
            })
        }
    } else if(format == "lexical-compressed" || !format) {
        return getInitialData(decompress(text), "lexical")
    } else if(format == "html"){
        const state = htmlToEditorStateStr(text)
        return getInitialData(state, "lexical")
    } else if(format == "html-compressed") {
        return getInitialData(decompress(text), "html")
    } else if(format == "plain-text"){
        return initializeEmpty(text)
    } else {
        throw("Formato de contenido desconocido: "+format)
    }
}