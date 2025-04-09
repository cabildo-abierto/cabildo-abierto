import {createHeadlessEditor} from "@lexical/headless"
import {$convertFromMarkdownString, $convertToMarkdownString} from "@lexical/markdown"
import {CA_TRANSFORMERS} from "./ca-transformers";
import {getEditorNodes} from "./nodes/get-editor-nodes";



export function editorStateToMarkdown(s: string){
    const nodes = getEditorNodes({allowImages: true})

    const editor = createHeadlessEditor({
        nodes,
        onError: () => {},
    })

    const parsed = editor.parseEditorState(s)

    editor.update(() => {
        editor.setEditorState(parsed)
    })

    let markdown: string
    editor.read(() => {
        markdown = $convertToMarkdownString(CA_TRANSFORMERS, undefined, true)
    })

    return markdown
}


export function markdownToEditorState(markdown: string): any {
    return JSON.parse(markdownToEditorStateStr(markdown))
}


export function markdownToEditorStateStr(markdown: string): string {
    const nodes = getEditorNodes({allowImages: true})

    const editor = createHeadlessEditor({
        nodes,
        onError: () => {},
    })

    editor.update(() => {
        $convertFromMarkdownString(markdown, CA_TRANSFORMERS, undefined, true, true)
    })

    const editorState = editor.read(() => {
        return editor.getEditorState()
    })
    return JSON.stringify(JSON.parse(JSON.stringify(editorState)))
}