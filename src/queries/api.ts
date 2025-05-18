import {
    Account,
    Profile, Session,
    TopicsGraph,
    TopicVersionAuthorsProps,
} from "@/lib/types"
import {splitUri, threadApiUrl} from "@/utils/uri";
import {FeedViewContent, ThreadViewContent} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {useQuery} from "@tanstack/react-query";
import {get} from "@/utils/fetch";
import {ProfileViewBasic} from "@/lex-api/types/ar/cabildoabierto/actor/defs";
import {FollowKind} from "@/components/profile/follow/followx-page";
import {TopicHistory, TopicView, TopicViewBasic} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {DatasetView, DatasetViewBasic} from "@/lex-api/types/ar/cabildoabierto/data/dataset";


function uriToKey(uri: string) {
    const {did, collection, rkey} = splitUri(uri)
    return [did, collection, rkey].join (":")
}


export function useAPI<T>(
    route: string,
    key: readonly unknown[],
    staleTime: number = Infinity
) {
    return useQuery<T>({
        queryKey: key,
        queryFn: async () => {
            const { data, error } = await get<T>(route)
            if (data) return data
            if (error) return null
            return data
        },
        staleTime,
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


export function threadQueryKey(uri: string){
    return ["thread", uriToKey(uri)]
}


export const useThread = (uri: string) => {
    return useAPI<ThreadViewContent>(threadApiUrl(uri), threadQueryKey(uri))
}


export const useTrendingTopics = () => {
    return useAPI<TopicViewBasic[]>("/trending-topics", ["trending-topics"])
}


export type FeedKind = "discusion" | "siguiendo" | "descubrir"


export function useProfile(handle: string) {
    return useAPI<Profile>("/profile/" + handle, ["profile", handle])
}


export function useFollowx(handle: string, kind: FollowKind) {
    const route = kind == "seguidores" ? "followers" : "follows"
    return useAPI<ProfileViewBasic[]>(`/${route}/` + handle, [kind, handle])
}


export type TopicFeed = {mentions: FeedViewContent[], replies: FeedViewContent[], topics: string[]}


export function useTopicFeed(id: string){
    return useAPI<TopicFeed>("/topic-feed/" + encodeURIComponent(id), ["topic-feed", id])
}


export function useCodes(){
    return useAPI<string[]>("/codes", ["codes"])
}


export function useTopic(id: string) {
    return useAPI<TopicView>("/topic/"+id, ["topic", id])
}


export function categoriesSearchParam(categories: string[]) {
    return categories.map(cat => `c=${encodeURIComponent(cat)}`).join("&");
}


export function useTopics(categories: string[], sortedBy: "popular" | "recent") {
    const query = categoriesSearchParam(categories)
    const url = `/topics/${sortedBy}${query ? `?${query}` : ""}`;
    return useAPI<TopicViewBasic[]>(url, ["topic", sortedBy, ...categories]);
}


export function useCategories() {
    return useAPI<{category: string, size: number}[]>("/categories", ["categories"])
}


export function useTopicHistory(id: string) {
    return useAPI<TopicHistory>("/topic-history/"+id, ["topic-history", id])
}


export function useTopicVersion(did: string, rkey: string) {
    return useAPI<TopicView>("/topic-version/"+did+"/"+rkey, ["topic-version", did, rkey])
}


export function useTopicVersionAuthors(did: string, rkey: string) {
    return useAPI<TopicVersionAuthorsProps>("/topic-version-authors/"+did+"/"+rkey, ["topic-version-authors", did, rkey])
}


export function useTopicVersionChanges(did: string, rkey: string) {
    return useAPI<TopicVersionAuthorsProps>("/topic-version-changes/"+did+"/"+rkey, ["topic-version-changes", did, rkey])
}


export function useDatasets() {
    return useAPI<DatasetViewBasic[]>("/datasets", ["datasets"])
}


export function useDataset(uri: string) {
    const {did, rkey} = splitUri(uri)
    return useAPI<DatasetView>("/dataset", ["dataset", did, rkey])
}


export function useCategoriesGraph() {
    return useAPI<TopicsGraph>("/categories-graph", ["categories-graph"])
}


export function useCategoryGraph(c: string) {
    return useAPI<TopicsGraph>("/category-graph/" + c, ["category-graph", c])
}