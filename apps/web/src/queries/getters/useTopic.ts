import {useAPI} from "@/components/utils/react/queries";
import {useEffect, useState} from "react";
import {ArCabildoabiertoWikiTopicVersion, ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api"
import {splitUri} from "@cabildo-abierto/utils/dist";
import {topicUrl} from "@/components/utils/react/url";
import { decompress } from "@cabildo-abierto/editor-core";


export function useTopicVersionQuoteReplies(uri: string){
    const {did, rkey} = splitUri(uri)
    return useAPI<ArCabildoabiertoFeedDefs.PostView[]>(`/topic-quote-replies/${did}/${rkey}`, ["topic-quote-replies", did, rkey])
}


export function useTopicTitle(id: string) {
    return useAPI<{title: string}>(`/topic-title/${encodeURIComponent(id)}`, ["topic-title", id])
}

export function useTopicWithNormalizedContent(id?: string, did?: string, rkey?: string){
    const key = did && rkey ? ["topic", did, rkey] : ["topic", id]
    const res = useAPI<ArCabildoabiertoWikiTopicVersion.TopicView>(topicUrl(did != null && rkey != null ? undefined : id, {did, rkey}, undefined, "topic"), key)
    const [newTopic, setNewTopic] = useState<ArCabildoabiertoWikiTopicVersion.TopicView | null | "loading">("loading")
    useEffect(() => {
        async function process() {
            const topic = res.data

            let newText: string
            if(topic.format == "markdown-compressed"){
                newText = decompress(topic.text)
            } else if(topic.format == "markdown"){
                newText = topic.text
            } else {
                setNewTopic(topic)
                return
            }

            const { markdownToEditorState, editorStateToMarkdown, normalizeMarkdown } = await import("@/components/editor/markdown-transforms");

            const state = markdownToEditorState(newText, true, true, topic.embeds)
            const markdown = editorStateToMarkdown(state)

            const newTopic: ArCabildoabiertoWikiTopicVersion.TopicView = {
                ...topic,
                text: normalizeMarkdown(markdown.markdown, true),
                embeds: markdown.embeds,
                format: "markdown"
            }

            setNewTopic(newTopic)
        }

        if(res.data){
            process()
        } else if(res.status == "success" && !res.data){
            setNewTopic(null)
        }
    }, [res.status, res.data])


    return {query: res, topic: newTopic}
}


export function useTopicHistory(id: string) {
    return useAPI<ArCabildoabiertoWikiTopicVersion.TopicHistory>("/topic-history/"+encodeURIComponent(id), ["topic-history", id])
}


export function useTopicVersion(did: string, rkey: string) {
    return useAPI<ArCabildoabiertoWikiTopicVersion.TopicView>("/topic-version/"+did+"/"+rkey, ["topic-version", did, rkey])
}
