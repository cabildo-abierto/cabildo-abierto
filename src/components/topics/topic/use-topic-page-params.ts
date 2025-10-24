import {useSearchParams} from "next/navigation";
import {WikiEditorState} from "@/lib/types";


export function isWikiEditorState(s: string): s is WikiEditorState {
    return ["editing"].includes(s)
}


export function useTopicPageParams() {
    const searchParams = useSearchParams()
    const did = searchParams.get("did")
    const rkey = searchParams.get("rkey")
    const topicId = searchParams.get("i")
    const s = searchParams.get("s")

    return {did, rkey, topicId, s: s == "editing" ? s : undefined}
}