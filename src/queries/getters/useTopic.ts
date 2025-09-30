import {useAPI} from "@/queries/utils";
import {splitUri, topicUrl} from "@/utils/uri";
import {PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {decompress} from "@/utils/compression";
import {useEffect, useState} from "react";
import {TopicHistory, TopicView} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";


export function useTopicVersionQuoteReplies(uri: string){
    const {did, rkey} = splitUri(uri)
    return useAPI<PostView[]>(`/topic-quote-replies/${did}/${rkey}`, ["topic-quote-replies", did, rkey])
}


export function useTopic(id?: string, did?: string, rkey?: string) {
    return useAPI<TopicView>(topicUrl(id, {did, rkey}, undefined, "topic"), ["topic", id, did, rkey].filter(x => x != undefined))
}


export function useTopicTitle(id: string) {
    return useAPI<{title: string}>(`/topic-title/${encodeURIComponent(id)}`, ["topic-title", id])
}

export function useTopicWithNormalizedContent(id?: string, did?: string, rkey?: string){
    const res = useAPI<TopicView>(topicUrl(id, {did, rkey}, undefined, "topic"), ["topic", id, did, rkey].filter(x => x != undefined))
    const [newTopic, setNewTopic] = useState<TopicView | null | "loading">("loading")

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

            const { markdownToEditorState, editorStateToMarkdown, normalizeMarkdown } = await import("../../../modules/ca-lexical-editor/src/markdown-transforms");

            const state = markdownToEditorState(newText, true, true, topic.embeds)
            const markdown = editorStateToMarkdown(state)

            const newTopic: TopicView = {
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
    return useAPI<TopicHistory>("/topic-history/"+encodeURIComponent(id), ["topic-history", id])
}


export function useTopicVersion(did: string, rkey: string) {
    return useAPI<TopicView>("/topic-version/"+did+"/"+rkey, ["topic-version", did, rkey])
}
