import {EditorState} from "lexical";
import {charCount, emptyOutput} from "@/components/editor";

export function validArticle(state: EditorState | undefined, charLimit: number, title?: string): {valid: boolean, empty: boolean} {
    const hasContent = state != undefined && !emptyOutput(state)
    const hasTitle = title != null && title.length > 0
    const empty = !hasContent && !hasTitle
    const charLimitPassed = hasContent && charLimit && charCount(state) > charLimit

    return {empty, valid: hasContent && hasTitle && !charLimitPassed}
}