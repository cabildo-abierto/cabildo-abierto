import {useAPI} from "@/components/utils/react/queries";
import {ArCabildoabiertoWikiTopic} from "@cabildo-abierto/api"
import {topicUrl} from "@/components/utils/react/url";


export function useTopicTitle(id: string) {
    return useAPI<{title: string}>(`/topic-title/${encodeURIComponent(id)}`, ["topic-title", id])
}

export function useTopic(id?: string, did?: string, rkey?: string){
    const key = did && rkey ? ["topic", did, rkey] : ["topic", id]
    return useAPI<ArCabildoabiertoWikiTopic.TopicView>(topicUrl(did != null && rkey != null ? undefined : id, {did, rkey}, undefined, "topic"), key)
}


export function useTopicHistory(id: string) {
    return useAPI<ArCabildoabiertoWikiTopic.TopicHistory>("/topic-history/"+encodeURIComponent(id), ["topic-history", id])
}


export function useTopicVersion(did: string, rkey: string) {
    return useAPI<ArCabildoabiertoWikiTopic.TopicView>("/topic-version/"+did+"/"+rkey, ["topic-version", did, rkey])
}
