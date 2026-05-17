import {useParams, useSearchParams} from "next/navigation";


export function useTopicPageParams() {
    const searchParams = useSearchParams()
    const params = useParams()
    const did = searchParams.get("did")
    const rkey = searchParams.get("rkey")
    const topicId = params["id"]
    const s = searchParams.get("s") // edit atenrior
    const edit = searchParams.get("edit")

    const editing = s == "editing" || edit == "true"

    return {did, rkey, topicId, editing}
}