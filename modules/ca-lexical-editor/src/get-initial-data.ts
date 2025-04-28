import {initializeEmpty} from "./lexical-editor";
import { InitialEditorStateType } from '@lexical/react/LexicalComposer';
import {LexicalEditor} from "lexical";
import {markdownToEditorStateStr} from "./markdown-transforms";
import {decompress} from "@/utils/compression";



export function getInitialData(text: string, format: string): InitialEditorStateType {

    if(format == "markdown"){
        if(!text || text.length == 0){
            return initializeEmpty("")
        }

        return (editor: LexicalEditor) => {
            editor.update(() => {
                try {
                    const strState = markdownToEditorStateStr(text)
                    const state = editor.parseEditorState(strState)
                    editor.setEditorState(state)
                } catch (err) {
                    console.error(err)
                    console.error("markdown:", text)
                }
            })
        }
    } else if(format == "lexical-compressed" || !format) {
        return getInitialData(decompress(text), "lexical")
    } else if(format == "lexical"){
        return (editor: LexicalEditor) => {
            editor.update(() => {
                const parsed = editor.parseEditorState(text)
                editor.setEditorState(parsed)
            })
        }
    } else if(format == "markdown-compressed"){
        return getInitialData(decompress(text), "markdown")
    } else if(format == "plain-text"){
        return initializeEmpty(text)
    } else {
        throw("Formato de contenido desconocido: "+format)
    }
}