import {QueryClient} from "@tanstack/react-query";
import {FeedViewContent, isThreadViewContent, ThreadViewContent} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {postOrArticle} from "@/utils/type-utils";
import {InfiniteFeed} from "@/components/feed/feed/feed";
import {produce} from "immer";
import {isArticle, isPost, isTopicVersion, splitUri} from "@/utils/uri";
import {TopicHistory, VersionInHistory} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";


export const contentQueriesFilter = (uri: string) => ({
    predicate: query => isQueryRelatedToUri(query.queryKey, uri)
})


export function isQueryRelatedToUri(queryKey: readonly unknown[], uri: string) {
    const {did, collection, rkey} = splitUri(uri)

    if (isPost(collection) || isArticle(collection)) {
        return queryKey[0] == "main-feed"
            || queryKey[0] == "profile-feed"
            || queryKey[0] == "thread"
            || queryKey[0] == "topic-feed"
            || queryKey[0] == "thread-feed"
    } else if (isTopicVersion(collection)) {
        return queryKey[0] == "topic"
            || queryKey[0] == "topic-history"
    }
}


function updateFeedElement(feed: InfiniteFeed<FeedViewContent>, uri: string, updater: (e: FeedViewContent["content"]) => FeedViewContent["content"] | null) {
    return produce(feed, draft => {
        for (let i = 0; i < draft.pages.length; i++) {
            const page = draft.pages[i]
            for (let j = 0; j < page.data.length; j++) {
                const element = page.data[j]
                if (postOrArticle(element.content) && element.content.uri == uri) {
                    const newContent = updater(element.content)
                    if (newContent) {
                        draft.pages[i].data[j].content = newContent
                    } else {
                        draft.pages[i].data = draft.pages[i].data.filter((_, index) => index != j)
                    }
                }
            }
        }
    })
}

export async function updateContentInQueries(qc: QueryClient, uri: string, updater: (e: FeedViewContent["content"]) => FeedViewContent["content"] | null) {
    qc.getQueryCache().getAll()
        .filter(q => Array.isArray(q.queryKey) && isQueryRelatedToUri(q.queryKey, uri))
        .forEach(q => {
            qc.setQueryData(q.queryKey, old => {
                if (!old) return old

                const k = q.queryKey

                if (k[0] == "thread") {
                    const t = old as ThreadViewContent
                    if (postOrArticle(t.content) && t.content.uri == uri) {
                        const newContent = updater(t.content)
                        if (!newContent) return
                        return {
                            ...t,
                            content: newContent
                        }
                    } else if (t.replies) {
                        return produce(t, draft => {
                            draft.replies = draft.replies.map(r => {
                                if (isThreadViewContent(r) && postOrArticle(r.content) && r.content.uri == uri) {
                                    return produce(r, draft => {
                                        draft.content = updater(r.content)
                                    })
                                }
                                return r
                            }).filter(r => r != null)
                        })
                    }
                    return t
                } else if (k[0] == "main-feed" || k[0] == "profile-feed" || k[0] == "topic-feed") {
                    return updateFeedElement(old as InfiniteFeed<FeedViewContent>, uri, updater)
                }
            })
        })
}


export async function updateTopicHistories(qc: QueryClient, uri: string, updater: (e: VersionInHistory) => VersionInHistory | null) {
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