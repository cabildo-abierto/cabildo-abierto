import {ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api/dist";
import {TopicViewBasicWithUrl} from "@/components/editor/plugins/FloatingLinkEditorPlugin";
import {get} from "@/components/utils/react/fetch";
import {topicUrl} from "@/components/utils/react/url";

export async function queryTopics(query: string): Promise<TopicViewBasicWithUrl[]> {
    if (query.trim().length == 0 || query.startsWith("/")) return []
    const res = await get<ArCabildoabiertoWikiTopicVersion.TopicViewBasic[]>(`/search-topics/${query}`)
    if (res.success == false) return []
    return res.value.map(x => ({
        ...x,
        url: topicUrl(x.id)
    }))
}