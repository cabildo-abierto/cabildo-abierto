import {QueryClient} from "@tanstack/react-query";
import {ArCabildoabiertoFeedDefs, ArCabildoabiertoWikiTopicVersion, ArCabildoabiertoDataDataset} from "@/lex-api"
import {postOrArticle} from "@/utils/type-utils";
import {InfiniteFeed} from "@/components/feed/feed/feed";
import {produce} from "immer";
import {isArticle, isDataset, isPost, isTopicVersion, splitUri} from "@/utils/uri";
import {QueryFilters} from "@tanstack/query-core";
import {$Typed} from "@atproto/api";
import {AppBskyFeedDefs} from "@/lex-api"
import {isPostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {areArraysEqual} from "@/utils/arrays";


// ¿En qué casos tenemos que actualizar?

// Se agrega o elimina un like a un post o artículo
//   [ok] se actualiza el post o artículo en todos los muros y threads, y en quoted-by
//   [ok] se agrega (o elimina) el usuario a liked-by del post (reset)
// Se agrega o elimina una republicación a un post o artículo
//   [ok] se actualiza el post o artículo en todos los muros y threads, y en quoted-by
//   [ok] se agrega (o elimina) el usuario al reposted-by del post
// Se crea un root post
//   [ok] se resetea el profile feed
//   [no hace falta] se actualiza la cantidad de posts en el perfil del usuario
// Se crea un reply post
//   [ok] se agrega a las replies del thread view content al que responde en todas las queries de threads
//   [ok] se aumenta el contador de respuestas del padre en todas las queries de threads y muros
// Se crea un quote post
//   [por ahora no hace falta] se agrega a main profile feed
//   [ok] se agrega al quoted-by del post (invalidacion)
// Se remueve un post de en discusion
//   [ok] se lo elimina de en discusion
//   [ok] se actualiza su etiqueta de en discusion en todos los muros y threads, y en quoted by
// Se elimina un post
//   [ok] se lo elimina de todos los muros y threads
//   [TO DO] si es reply: se reduce el contador de respuestas del padre en todas las queries de threads y muros
//   [TO DO] si tiene quote: se reduce el contador de quotes del quoteado en todas las queries de threads y muros
//   [ok] si tiene quote: se lo elimina de quoted-by del quoteado

export async function invalidateQueries(qc: QueryClient, queries: string[][]) {
    await qc.invalidateQueries({
        predicate: query => {
            const res = queries.some(q => areArraysEqual(q, query.queryKey as string[]))
            if(res) console.log("invalidating", query.queryKey)
            return res
        }})
}

export async function resetQueries(qc: QueryClient, queries: string[][]) {
    await qc.resetQueries({
        predicate: query => {
            return queries.some(q => areArraysEqual(q, query.queryKey as string[]))
        }})
}


export const filterQueriesCancelledByUriUpdate = (uri: string): QueryFilters<readonly unknown[]> => ({
    predicate: query => {
        return true
    }
})


export const contentQueriesFilter = (uri: string): QueryFilters<readonly unknown[]> => ({
    predicate: query => isQueryRelatedToUri(query.queryKey, uri)
})


export function isQueryRelatedToUri(queryKey: readonly unknown[], uri: string) {
    const {collection} = splitUri(uri)
    if (isPost(collection) || isArticle(collection)) {
        return queryKey[0] == "main-feed"
            || queryKey[0] == "profile-feed"
            || queryKey[0] == "thread"
            || queryKey[0] == "topic-feed"
    } else if (isTopicVersion(collection)) {
        return queryKey[0] == "topic"
            || queryKey[0] == "topic-history"
    } else if (isDataset(collection)){
        return queryKey[0] == "dataset" || queryKey[0] == "datasets"
    }
}


type Updater<T> = (_: T) => T | null

export function updateFeedElement(feed: InfiniteFeed<ArCabildoabiertoFeedDefs.FeedViewContent>, uri: string, updater: Updater<ArCabildoabiertoFeedDefs.FeedViewContent["content"]>) {
    return produce(feed, draft => {
        if(!feed) return
        for (let i = 0; i < draft.pages.length; i++) {
            const page = draft.pages[i]
            for (let j = 0; j < page.data.length; j++) {
                const element = page.data[j]
                if (element.reply && element.reply.parent && postOrArticle(element.reply.parent) && element.reply.parent.uri == uri){
                    console.log("is parent!")
                    const newParent = updater(element.reply.parent)
                    if(newParent){
                        console.log("replacing parent")
                        element.reply.parent = newParent
                    } else if(element.reply.root && postOrArticle(element.reply.root) && element.reply.root.uri != uri) {
                        page.data[j] = {
                            content: element.reply.root
                        }
                    } else {
                        page.data = page.data.toSpliced(j, 1)
                    }
                } else if(element.reply && element.reply.root && postOrArticle(element.reply.root) && element.reply.root.uri == uri){
                    const newRoot = updater(element.reply.root)
                    if(newRoot){
                        element.reply.root = newRoot
                    } else {
                        page.data = page.data.toSpliced(j, 1)
                    }
                } else if (postOrArticle(element.content) && element.content.uri == uri) {
                    const newContent = updater(feed.pages[i].data[j].content)
                    element.content = newContent ?? {$type: "deleted"}
                }
            }
        }
    })
}


// se actualiza un muro de PostViews
export function updatePostFeedElement(feed: InfiniteFeed<ArCabildoabiertoFeedDefs.PostView>, uri: string, updater: QueryContentUpdater<ArCabildoabiertoFeedDefs.FeedViewContent["content"]>) {
    return produce(feed, draft => {
        if(!feed) return
        for (let i = 0; i < draft.pages.length; i++) {
            const page = draft.pages[i]
            for (let j = 0; j < page.data.length; j++) {
                const element = page.data[j]
                if (element.uri == uri) {
                    const newContent = updater({$type: "ar.cabildoabierto.feed.defs#postView", ...feed.pages[i].data[j]})
                    if (newContent && isPostView(newContent)) {
                        page.data[j] = newContent
                    } else {
                        page.data = draft.pages[i].data.filter((_, index) => index != j)
                    }
                }
            }
        }
    })
}


export type MaybeThreadViewContent = $Typed<ArCabildoabiertoFeedDefs.ThreadViewContent> |
    $Typed<AppBskyFeedDefs.NotFoundPost> |
    $Typed<AppBskyFeedDefs.BlockedPost> |
    {$type: string}

export function updateThreadViewContentQuery(uri: string, t: MaybeThreadViewContent, updater: QueryContentUpdater<ArCabildoabiertoFeedDefs.FeedViewContent["content"]>): MaybeThreadViewContent {
    if(!ArCabildoabiertoFeedDefs.isThreadViewContent(t)) return t

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
        parent: t.parent ? updateThreadViewContentQuery(uri, t.parent, updater) : undefined
    }
}


export type QueryContentUpdater<T> = (_: T) => T | null


export function updateContentInQuery(queryKey: string[], qc: QueryClient, uri: string, updater: QueryContentUpdater<ArCabildoabiertoFeedDefs.FeedViewContent["content"]>) {
    const k = queryKey
    if(k[0] == "thread"){
        qc.setQueryData(k, old => {
            if(!old) return old
            const t = old as MaybeThreadViewContent
            return updateThreadViewContentQuery(uri, t, updater)
        })
    } else if(k[0] == "main-feed" || k[0] == "profile-feed" || k[0] == "topic-feed"){
        qc.setQueryData(k, old => {
            if(!old) return old
            return updateFeedElement(old as InfiniteFeed<ArCabildoabiertoFeedDefs.FeedViewContent>, uri, updater)
        })
    } else if(k[0] == "topic-quote-replies") {
        qc.setQueryData(k, old => {
            return produce(old as ArCabildoabiertoFeedDefs.PostView[], draft => {
                const index = draft.findIndex(v => v.uri == uri)
                if(index != -1) {
                    const newVersion = updater({
                        $type: "ar.cabildoabierto.feed.defs#postView",
                        ...draft[index]
                    })
                    if (!newVersion) {
                        draft.splice(index, 1)
                    } else if(ArCabildoabiertoFeedDefs.isPostView(newVersion)){
                        draft[index] = newVersion
                    }
                }
            })
        })
    } else if(k[0] == "details-content" && k[1] == "quotes") {
        qc.setQueryData(k, old => {
            if(!old) return old
            return updatePostFeedElement(old as InfiniteFeed<ArCabildoabiertoFeedDefs.PostView>, uri, updater)
        })
    }
}


// actualiza un FeedViewContent["content"] en queries de threads o muros
export function updateContentInQueries(qc: QueryClient, uri: string, updater: QueryContentUpdater<ArCabildoabiertoFeedDefs.FeedViewContent["content"]>, filter?: (x: string[]) => boolean) {
    qc.getQueryCache()
        .getAll()
        .filter(q => Array.isArray(q.queryKey) && (!filter || filter(q.queryKey as string[])))
        .forEach(q => {
            updateContentInQuery(q.queryKey as string[], qc, uri, updater)
        })
}


export async function updateTopicHistories(qc: QueryClient, uri: string, updater: (_: ArCabildoabiertoWikiTopicVersion.VersionInHistory) => ArCabildoabiertoWikiTopicVersion.VersionInHistory | null) {
    qc.getQueryCache().getAll()
        .filter(q => Array.isArray(q.queryKey) && q.queryKey[0] == "topic-history")
        .forEach(q => {
            qc.setQueryData(q.queryKey, old => {
                if (!old) return old
                const history = old as ArCabildoabiertoWikiTopicVersion.TopicHistory
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


export async function updateDatasets(qc: QueryClient, uri: string, updater: (_: ArCabildoabiertoDataDataset.DatasetViewBasic) => ArCabildoabiertoDataDataset.DatasetViewBasic | null) {
    qc.setQueryData(["datasets"], old => {
        return produce(old as ArCabildoabiertoDataDataset.DatasetViewBasic[] | undefined, draft => {
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