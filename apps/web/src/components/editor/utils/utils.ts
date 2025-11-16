import {$getRoot, EditorState} from "lexical"


export function emptyOutput(editorState: EditorState | undefined) {
    if (!editorState) return true

    return editorState.read(() => {
        const root = $getRoot()
        const children = root.getChildren()

        for (let i = 0; i < children.length; i++) {
            const child = children[i]
            if (child.getTextContent().trim() !== "") {
                return false
            }
        }

        return true
    })
}


export function charCount(state: EditorState | undefined) {
    return state?.read(() => {
        const root = $getRoot()
        return root.getTextContentSize()
    })
}