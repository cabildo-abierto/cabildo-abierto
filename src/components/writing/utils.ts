import {EditorState} from "lexical";
import {charCount, emptyOutput} from "../utils/lexical";

export function validPost(state: EditorState | undefined, charLimit: number, type: string, images?: {
    src: string
}[], title?: string) {
    if (type == "Post" && (!title || title.length == 0)) return {problem: "no title"}
    if (state != undefined && !emptyOutput(state)) {
        if (charLimit) {
            const count = charCount(state)
            if (count > charLimit) return {problem: "too many characters"}
        }
        return {}
    } else {
        if (images && images.length > 0) {
            return {}
        } else {
            return {problem: "no state"}
        }
    }
}