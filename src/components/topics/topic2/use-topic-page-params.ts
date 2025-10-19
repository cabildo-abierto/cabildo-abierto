import {useSearchParams} from "next/navigation";

export function useTopicPageParams() {
    const searchParams = useSearchParams()
    const did = searchParams.get("did")
    const rkey = searchParams.get("rkey")
    const topicId = searchParams.get("i")
    const s = searchParams.get("s")

    return {did, rkey, topicId, s}
}