import {QueryClient} from "@tanstack/react-query";
import {
    FeedViewContent,
    isPostView,
    isThreadViewContent, PostView,
    ThreadViewContent
} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {postOrArticle} from "@/utils/type-utils";
import {InfiniteFeed} from "@/components/feed/feed/feed";
import {produce} from "immer";
import {isArticle, isDataset, isPost, isTopicVersion, splitUri} from "@/utils/uri";
import {TopicHistory, VersionInHistory} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {DatasetViewBasic} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {QueryFilters} from "@tanstack/query-core";
import {$Typed} from "@atproto/api";
import {BlockedPost, NotFoundPost} from "@/lex-api/types/app/bsky/feed/defs";


export const contentQueriesFilter = (uri: string): QueryFilters<readonly unknown[]> => ({
    predicate: query => isQueryRelatedToUri(query.queryKey, uri)
})


export const specificContentQueriesFilter = (uri: string): QueryFilters<readonly unknown[]> => ({
    predicate: query => isQueryAboutUri(query.queryKey, uri)
})


export function isQueryAboutUri(queryKey: readonly unknown[], uri: string) {
    const {collection} = splitUri(uri)
    if (isPost(collection) || isArticle(collection) || isDataset(collection)) {
        return queryKey[0] == "thread" && queryKey[1] == uri
    }
    return false
}


export function isQueryRelatedToUri(queryKey: readonly unknown[], uri: string) {
    const {collection} = splitUri(uri)
    if (isPost(collection) || isArticle(collection)) {
        return queryKey[0] == "main-feed"
            || queryKey[0] == "profile-feed"
            || queryKey[0] == "thread"
            || queryKey[0] == "topic-feed"
            || queryKey[0] == "thread-feed"
    } else if (isTopicVersion(collection)) {
        return queryKey[0] == "topic"
            || queryKey[0] == "topic-history"
    } else if (isDataset(collection)){
        return queryKey[0] == "dataset" || queryKey[0] == "datasets"
    }
}


type Updater<T> = (_: T) => T | null

function updateFeedElement(feed: InfiniteFeed<FeedViewContent>, uri: string, updater: Updater<FeedViewContent["content"]>) {
    return produce(feed, draft => {
        if(!feed) return
        for (let i = 0; i < draft.pages.length; i++) {
            const page = draft.pages[i]
            for (let j = 0; j < page.data.length; j++) {
                const element = page.data[j]
                if (isPostView(element.content) && element.reply && element.reply.parent && postOrArticle(element.reply.parent) && element.reply.parent.uri == uri){
                    const newParent = updater(element.reply.parent)
                    if(newParent){
                        element.reply.parent = newParent
                    } else if(element.reply.root) {
                        page.data[j] = {
                            content: element.reply.root
                        }
                    } else {
                        page.data = page.data.toSpliced(j, 1)
                    }
                } else if(isPostView(element.content) && element.reply && element.reply.root && postOrArticle(element.reply.root) && element.reply.root.uri == uri){
                    page.data = page.data.toSpliced(j, 1)
                } else if (postOrArticle(element.content) && element.content.uri == uri) {
                    const newContent = updater(feed.pages[i].data[j].content)
                    if (newContent) {
                        element.content = newContent
                    } else {
                        page.data = draft.pages[i].data.filter((_, index) => index != j)
                    }
                }
            }
        }
    })
}

type MaybeThreadViewContent = $Typed<ThreadViewContent> | $Typed<NotFoundPost> | $Typed<BlockedPost> | {$type: string}

function updateThreadViewContentQuery(uri: string, t: MaybeThreadViewContent, updater: (_: FeedViewContent["content"]) => FeedViewContent["content"] | null, isParent: boolean = false): MaybeThreadViewContent {
    if(!isThreadViewContent(t)) return t

    let content = t.content

    if(postOrArticle(content) && content.uri == uri){
        const newContent = updater(content)
        if(!newContent) return null
        content = newContent
    }

    const replies = t.replies
        ?.map(r => updateThreadViewContentQuery(uri, r, updater))
        .filter(r => r != null)

    return {
        $type: "ar.cabildoabierto.feed.defs#threadViewContent",
        replies,
        content,
        parent: t.parent ? updateThreadViewContentQuery(uri, t.parent, updater, true) : undefined
    }
}


export function updateContentInQueries(qc: QueryClient, uri: string, updater: (_: FeedViewContent["content"]) => FeedViewContent["content"] | null) {
    qc.getQueryCache()
        .getAll()
        .filter(q => Array.isArray(q.queryKey) && isQueryRelatedToUri(q.queryKey, uri))
        .forEach(q => {
            qc.setQueryData(q.queryKey, old => {
                if (!old) return old

                const k = q.queryKey

                if (k[0] == "thread") {
                    const t = old as MaybeThreadViewContent
                    return updateThreadViewContentQuery(uri, t, updater)
                } else if (k[0] == "main-feed" || k[0] == "profile-feed" || k[0] == "thread-feed" || k[0] == "topic-feed") {
                    return updateFeedElement(old as InfiniteFeed<FeedViewContent>, uri, updater)
                }
            })
        })
}


export async function updateTopicHistories(qc: QueryClient, uri: string, updater: (_: VersionInHistory) => VersionInHistory | null) {
    qc.getQueryCache().getAll()
        .filter(q => Array.isArray(q.queryKey) && q.queryKey[0] == "topic-history")
        .forEach(q => {
            qc.setQueryData(q.queryKey, old => {
                if (!old) return old
                const history = old as TopicHistory
                return produce(history, draft => {
                    const index = draft.versions.findIndex(v => v.uri == uri)
                    const newVersion = updater(draft.versions[index])
                    if (!newVersion) {
                        draft.versions = draft.versions.filter(v => v.uri != uri)
                    } else {
                        draft.versions[index] = newVersion
                    }
                })
            })
        })
}


export async function updateDatasets(qc: QueryClient, uri: string, updater: (_: DatasetViewBasic) => DatasetViewBasic | null) {
    qc.setQueryData(["datasets"], old => {
        return produce(old as DatasetViewBasic[] | undefined, draft => {
            if(!draft) return
            const index = draft.findIndex(d => d.uri == uri)
            const newVersion = updater(draft[index])
            if(!newVersion){
                draft.splice(index, 1)
            } else {
                draft[index] = newVersion
            }
        })
    })
}


export async function updateTopicFeedQueries(qc: QueryClient, uri: string, updater: (_: FeedViewContent["content"]) => FeedViewContent["content"] | null) {
    qc.getQueryCache().getAll()
        .filter(q => Array.isArray(q.queryKey))
        .forEach(q => {
            qc.setQueryData(q.queryKey, old => {
                if (!old) return old

                if(q.queryKey[0] == "topic-quote-replies"){
                    return produce(old as PostView[], draft => {
                        const index = draft.findIndex(v => v.uri == uri)
                        if(index != -1) {
                            const newVersion = updater({
                                $type: "ar.cabildoabierto.feed.defs#postView",
                                ...draft[index]
                            })
                            if (!newVersion) {
                                draft.splice(index)
                            } else if(isPostView(newVersion)){
                                draft[index] = newVersion
                            }
                        }
                    })
                }
            })
        })
}