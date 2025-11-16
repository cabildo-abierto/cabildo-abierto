import {ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api/dist";
import {TopicViewBasicWithUrl} from "@/components/editor/plugins/FloatingLinkEditorPlugin";
import {get} from "@/components/utils/react/fetch";
import {topicUrl} from "@/components/utils/react/url";

export async function queryTopics(query: string): Promise<TopicViewBasicWithUrl[]> {
    if (query.trim().length == 0 || query.startsWith("/")) return []
    const {error, data} = await get<ArCabildoabiertoWikiTopicVersion.TopicViewBasic[]>(`/search-topics/${query}`)
    if (error) return []
    return data.map(x => ({
        ...x,
        url: topicUrl(x.id)
    }))
}