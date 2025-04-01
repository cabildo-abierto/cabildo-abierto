import {EditorState} from "lexical";
import {charCount, emptyOutput} from "@/utils/lexical";

export function validArticle(state: EditorState | undefined, charLimit: number, title?: string) {
    if (!title || title.length == 0) return {problem: "no title"}
    if (state != undefined && !emptyOutput(state)) {
        if (charLimit) {
            const count = charCount(state)
            if (count > charLimit) return {problem: "too many characters"}
        }
        return {}
    } else {
        return {problem: "no state"}
    }
}