import {isValidJSON} from "@/utils/utils";
import {initializeEmpty} from "./lexical-editor";
import { InitialEditorStateType } from '@lexical/react/LexicalComposer';
import {LexicalEditor} from "lexical";
import {markdownToEditorStateStr} from "./markdown-transforms";
import {decompress} from "@/utils/compression";

/*

const initialValue = `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Este tema está vacío. Editalo para agregar una primera versión.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`


function getInitialData(text: string | undefined, textFormat: string, readOnly: boolean): InitialEditorStateType{
    if(!text){
        return ""
    }
    if(!textFormat || textFormat == "lexical-compressed") {
        let contentText: string
        try {
            contentText = decompress(text)
        } catch {
            return "Ocurrió un error al leer el contenido del tema"
        }
        let initialData
        let emptyContent = contentText == "" || contentText == "Este artículo está vacío!"
        if (readOnly && emptyContent) {
            initialData = initialValue
        } else {
            initialData = contentText
        }

        return initialData
    } else if (textFormat == "lexical") {
        return text
    } else if(textFormat == "markdown"){
        return (_: LexicalEditor) => {
            $convertFromMarkdownString(text, CA_TRANSFORMERS)
        }
    } else if(textFormat == "markdown-compressed"){
        const contentText = decompress(text)
        return (_: LexicalEditor) => {
            $convertFromMarkdownString(contentText, CA_TRANSFORMERS)
        }
    } else if(textFormat == "html"){
        return (editor: LexicalEditor) => {
            const parser = new DOMParser();
            const dom = parser.parseFromString(text, "text/html");
            const nodes = $generateNodesFromDOM(editor, dom);

            $insertNodes(nodes);
        }

    } else {
        throw Error("Unknown format " + textFormat)
    }
}
 */


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