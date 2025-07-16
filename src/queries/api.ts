import {
    Account,
    Profile, Session,
    TopicsGraph, TopicVersionChangesProps,
} from "@/lib/types"
import {splitUri, threadApiUrl, topicUrl} from "@/utils/uri";
import {
    FeedViewContent,
    isFullArticleView,
    ThreadViewContent
} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {useQuery} from "@tanstack/react-query";
import {get} from "@/utils/fetch";
import {ProfileViewBasic} from "@/lex-api/types/ar/cabildoabierto/actor/defs";
import {FollowKind} from "@/components/profile/follow/followx-page";
import {TopicHistory, TopicView, TopicViewBasic} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {DatasetView, DatasetViewBasic} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {ValidationRequestView} from "@/components/admin/admin-validation";
import {DonationHistory} from "@/components/aportar/donation-history";
import {StatsDashboard} from "@/components/admin/stats";
import {Notification as CANotification} from "@/lex-api/types/ar/cabildoabierto/notification/listNotifications"
import {ConvoView} from "@atproto/api/src/client/types/chat/bsky/convo/defs";
import {$Typed} from "@atproto/api";
import {DeletedMessageView, MessageView} from "@/lex-api/types/chat/bsky/convo/defs";
import {editorStateToMarkdown, markdownToEditorState, normalizeMarkdown} from "../../modules/ca-lexical-editor/src/markdown-transforms";
import {decompress} from "@/utils/compression";
import {useMemo} from "react";
import {ArticleEmbedView} from "@/lex-api/types/ar/cabildoabierto/feed/article";


function uriToKey(uri: string) {
    const {did, collection, rkey} = splitUri(uri)
    return [did, collection, rkey].join (":")
}


export function useAPI<T>(
    route: string,
    key: readonly unknown[],
    staleTime: number = Infinity,
    enabled: boolean = true
) {
    return useQuery<T>({
        queryKey: key,
        queryFn: async () => {
            const {data, error} = await get<T>(route)
            if (data) return data
            if (error) return null
            return data
        },
        staleTime,
        enabled
    })
}

export const useSession = (inviteCode?: string) => {
    const res = useAPI<Session>("/session" + (inviteCode ? "/" + inviteCode : ""), ["session"])
    return {...res, user: res.data}
}

export const useAccount = () => {
    const res = useAPI<Account>("/account", ["account"])
    return {...res, account: res.data}
}

type ValidationRequestStatus = {
    type: "org" | "persona" | null,
    result?: "Aceptada" | "Rechazada" | "Pendiente"
}

export const useCurrentValidationRequest = () => {
    const res = useAPI<ValidationRequestStatus>("/validation-request", ["validation-request"])
    return {...res, user: res.data}
}


export const usePendingValidationRequests = () => {
    const res = useAPI<{requests: ValidationRequestView[], count: number}>("/pending-validation-requests", ["pending-validation-requests"])
    return {...res, user: res.data}
}


export function threadQueryKey(uri: string){
    return ["thread", uriToKey(uri)]
}


export const useThreadWithNormalizedContent = (uri: string) => {
    const res = useAPI<ThreadViewContent>(threadApiUrl(uri), threadQueryKey(uri))

    const newContent = useMemo(() => {
        if(res.data){
            const content = res.data

            if(isFullArticleView(content.content)){
                let newText: string
                if(content.content.format == "markdown-compressed"){
                    newText = decompress(content.content.text)
                } else if(content.content.format == "markdown"){
                    newText = content.content.text
                } else {
                    return content
                }

                const state = markdownToEditorState(
                    newText, true, true, content.content.embeds)
                const markdown = editorStateToMarkdown(state)

                return {
                    ...content,
                    content: {
                        ...content.content,
                        text: normalizeMarkdown(markdown.markdown, true),
                        embeds: markdown.embeds,
                        format: "markdown"
                    }
                }
            } else {
                return content
            }
        }
    }, [res.data])


    return {query: res, thread: newContent}
}

export type TimePeriod = "day" | "week" | "month" | "all"

export const useTrendingTopics = (time: TimePeriod) => {
    return useAPI<TopicViewBasic[]>(`/trending-topics/${time}`, ["trending-topics", time])
}


export function useProfile(handle: string) {
    return useAPI<Profile>("/profile/" + handle, ["profile", handle])
}


export function useFollowx(handle: string, kind: FollowKind) {
    const route = kind == "seguidores" ? "followers" : "follows"
    return useAPI<ProfileViewBasic[]>(`/${route}/` + handle, [route, handle])
}


export type TopicFeed = {mentions: FeedViewContent[], replies: FeedViewContent[], topics: string[]}


export function useTopicFeed(id?: string, did?: string, rkey?: string){
    return useAPI<TopicFeed>(topicUrl(id, {did, rkey}, undefined, "topic-feed"), ["topic-feed", id, did, rkey].filter(x => x != undefined))
}


export function useTopic(id?: string, did?: string, rkey?: string) {
    return useAPI<TopicView>(topicUrl(id, {did, rkey}, undefined, "topic"), ["topic", id, did, rkey].filter(x => x != undefined))
}


export function useTopicWithNormalizedContent(id?: string, did?: string, rkey?: string){
    const res = useAPI<TopicView>(topicUrl(id, {did, rkey}, undefined, "topic"), ["topic", id, did, rkey].filter(x => x != undefined))

    const newTopic = useMemo(() => {
        if(res.data){
            const topic = res.data

            let newText: string
            if(topic.format == "markdown-compressed"){
                newText = decompress(topic.text)
            } else if(topic.format == "markdown"){
                newText = topic.text
            } else {
                return topic
            }

            const state = markdownToEditorState(newText, true, true, topic.embeds)
            const markdown = editorStateToMarkdown(state)

            const newTopic: TopicView = {
                ...topic,
                text: normalizeMarkdown(markdown.markdown, true),
                embeds: markdown.embeds,
                format: "markdown"
            }

            return newTopic
        }
    }, [res.data])


    return {query: res, topic: newTopic}
}


export function categoriesSearchParam(categories: string[]) {
    return categories.map(cat => `c=${encodeURIComponent(cat)}`).join("&");
}


export function useTopics(categories: string[], sortedBy: "popular" | "recent", time: TimePeriod) {
    const query = categoriesSearchParam(categories)
    const url = `/topics/${sortedBy}/${time}${query ? `?${query}` : ""}`;
    return useAPI<TopicViewBasic[]>(url, ["topic", sortedBy, ...categories, time]);
}


export function useCategories() {
    return useAPI<string[]>("/categories", ["categories"])
}



export function useTopicHistory(id: string) {
    return useAPI<TopicHistory>("/topic-history/"+id, ["topic-history", id])
}


export function useTopicVersion(did: string, rkey: string) {
    return useAPI<TopicView>("/topic-version/"+did+"/"+rkey, ["topic-version", did, rkey])
}


export function useTopicVersionChanges(did: string, rkey: string, prevDid: string, prevRkey: string) {
    return useAPI<TopicVersionChangesProps>("/topic-version-changes/"+did+"/"+rkey+"/"+prevDid+"/"+prevRkey, ["topic-version-changes", did, rkey, prevDid, prevRkey])
}


export function useDatasets() {
    return useAPI<DatasetViewBasic[]>("/datasets", ["datasets"])
}


export function useDataset(uri: string | null) {
    let route: string
    let key: string[] = []
    if(uri){
        const {did, collection, rkey} = splitUri(uri)
        route = `/dataset/${did}/${collection}/${rkey}`
        key = ["dataset", did, collection, rkey]
    }
    return useAPI<DatasetView>(route, key, Infinity, uri != null)
}


export function useCategoriesGraph() {
    return useAPI<TopicsGraph>("/categories-graph", ["categories-graph"])
}


export function useCategoryGraph(categories: string[]) {
    const query = categoriesSearchParam(categories)
    return useAPI<TopicsGraph>("/category-graph?" + query, ["category-graph", categories.sort()])
}


export function useDonationHistory() {
    return useAPI<DonationHistory>("/donation-history", ["donation-history"])
}


export function useMonthlyValue() {
    return useAPI<number>("/monthly-value", ["monthly-value"])
}


export function useFundingState() {
    return useAPI<number>("/funding-state", ["funding-state"])
}


export function useStatsDashboard() {
    return useAPI<StatsDashboard>("/stats-dashboard", ["stats-dashboard"])
}


export function useNotifications() {
    return useAPI<CANotification[]>("/notifications/list", ["notifications"])
}


export function useUnreadNotificationsCount() {
    return useAPI<number>("/notifications/unread-count", ["unread-notifications-count"])
}


export function useConversations() {
    return useAPI<ConvoView[]>("/conversations/list", ["conversations"])
}


export type Conversation = {
    messages: PrivateMessage[]
    conversation: ConvoView
}

export type PrivateMessage = ($Typed<MessageView> | $Typed<DeletedMessageView> | {$type: string})

export function useConversation(convoId: string) {
    return useAPI<Conversation>(`/conversation/${convoId}`, ["conversation", convoId])
}

type AccessRequest = {
    id: string
    email: string
    comment: string
    createdAt: Date
    sentInviteAt: Date | null
}

export function useAccessRequests() {
    return useAPI<AccessRequest[]>("/access-requests", ["access-requests"])
}

export type UserSyncStatus = {
    did: string
    handle: string | null
    mirrorStatus: string | null
    CAProfile: {
        createdAt: Date
    } | null
}

export function useUsersSyncStatus() {
    return useAPI<UserSyncStatus[]>("/sync-status", ["sync-status"])
}


export type Draft = {
    text: string
    summary: string
    embeds?: ArticleEmbedView[]
    collection: string
    createdAt: Date
    lastUpdate: Date
    id: string
    title?: string
}


export type DraftPreview = {
    summary: string
    collection: string
    createdAt: Date
    lastUpdate: Date
    id: string
    title?: string
}


export function useDrafts() {
    return useAPI<DraftPreview[]>("/drafts", ["drafts"])
}


export function useDraft(id: string) {
    return useAPI<Draft>(`/draft/${id}`, ["draft", id])
}