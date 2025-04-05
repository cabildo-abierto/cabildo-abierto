import {createHeadlessEditor} from "@lexical/headless"
import {$convertFromMarkdownString, $convertToMarkdownString} from "@lexical/markdown"
import {CA_TRANSFORMERS} from "../../../modules/ca-lexical-editor/src/ca-transformers";
import {getEditorNodes} from "../../../modules/ca-lexical-editor/src/nodes/get-editor-nodes";



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
        markdown = $convertToMarkdownString(CA_TRANSFORMERS, undefined, false)
    })

    return markdown
}


export function markdownToEditorState(markdown: string): string {
    const nodes = getEditorNodes({allowImages: true})

    const editor = createHeadlessEditor({
        nodes,
        onError: () => {},
    });

    editor.update(() => {
        $convertFromMarkdownString(markdown, CA_TRANSFORMERS, undefined, false, true)
    })

    const s = editor.read(() => {
        return editor.getEditorState().toJSON()
    })

    return JSON.stringify(s)
}