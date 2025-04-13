"use server"
import {ThreadViewPost} from "@atproto/api/src/client/types/app/bsky/feed/defs";
import {ArticleProps, FastPostProps, FeedContentProps, ThreadProps, ThreadReplyProps,} from "@/lib/definitions";
import {getSessionAgent, getSessionDid} from "../auth";
import {reactionsQuery, recordQuery, threadQuery} from "../utils";
import {isCAUser} from "../user/users";
import {db} from "@/db";
import {getTextFromBlob} from "../topic/topics";
import {addViewerEngagementToFeed} from "../feed/get-user-engagement";
import {getCollectionFromUri, getDidFromUri, getRkeyFromUri, isArticle, isPost, isQuotePost} from "@/utils/uri";
import {getFeed} from "@/server-actions/feed/feed";
import {FeedSkeleton} from "@/server-actions/feed/profile/main";
import {rootCreationDateSortKey} from "@/server-actions/feed/utils";


function threadViewPostToThread(thread: ThreadViewPost): {thread: ThreadProps} {
    const record = thread.post.record as {createdAt: string, text: string, facets?: any, embed?: any}

    const post: FastPostProps = {
        uri: thread.post.uri,
        cid: thread.post.cid,
        author: thread.post.author,
        collection: "app.bsky.feed.post",
        createdAt: new Date(record.createdAt),
        rkey: getRkeyFromUri(thread.post.uri),
        content: {
            text: record.text,
            post: {
                facets: record.facets ? JSON.stringify(record.facets) : undefined,
                embed: record.embed ? JSON.stringify(record.embed) : undefined
            }
        },
        replyCount: thread.post.replyCount,
        repostCount: thread.post.repostCount,
        likeCount: thread.post.likeCount
    }

    const replies: FastPostProps[] = thread.replies ? thread.replies.map((r) => {
        if("notFound" in r && r.notFound || "blocked" in r && r.blocked) return null
        const replyThread = r as ThreadViewPost
        if(replyThread.$type == "app.bsky.feed.defs#threadViewPost"){
            return threadViewPostToThread(replyThread).thread.post as FastPostProps
        } else {
            return null
        }
    }).filter((r) => (r != null)) : []

    return {thread: {post, replies}}
}


export async function getThreadFromATProto(uri: string): Promise<{thread?: ThreadProps, error?: string}> {
    const {agent} = await getSessionAgent()

    try {
        const {data} = await agent.getPostThread({
            uri
        })
        if(!("notFound" in data && data.notFound) && !("blocked" in data && data.blocked)){
            const thread = data.thread as ThreadViewPost

            return threadViewPostToThread(thread)
        } else {
            return {error: "No se encontró el post."}
        }
    } catch (err) {
        console.error(err)
        return {error: "Ocurrió un error al obtener el hilo."}
    }
}


export async function getThreadRepliesSkeleton(uri: string): Promise<FeedSkeleton> {
    return await db.record.findMany({
        select: {
            uri: true
        },
        where: {
            content: {
                post: {
                    replyToId: uri
                }
            }
        }
    })
}


export async function getThreadReplies(uri: string): Promise<ThreadReplyProps[]> {
    const {feed} = await getFeed({
        getSkeleton: async () => {return await getThreadRepliesSkeleton(uri)},
        sortKey: rootCreationDateSortKey
    })

    return feed as ThreadReplyProps[]
}

export async function getThreadContent(uri: string): Promise<FeedContentProps> {
    const content = (await getFeed({
        getSkeleton: async () => {return [{uri}]},
        sortKey: () => null
    })).feed[0]

    if(content.collection == "ar.com.cabildoabierto.article" && content.content.textBlob){
        content.content.text = await getTextFromBlob(content.content.textBlob)
    }

    return content
}


export async function getThread(uri: string): Promise<{thread?: ThreadProps, error?: string}> {
    const did = await getSessionDid()

    try {
        const mainPostQ = getThreadContent(uri)

        const repliesQ = getThreadReplies(uri)

        let [mainPost, replies] = await Promise.all([mainPostQ, repliesQ])

        if(isArticle(mainPost.collection)){
            for(let i = 0; i < replies.length; i++){
                if(replies[i].collection == "ar.com.cabildoabierto.quotePost"){
                    replies[i].content.post.replyTo.text = (mainPost as ArticleProps).content.text
                }
            }
        }

        mainPost = (await addViewerEngagementToFeed(did, [mainPost]))[0]

        if(!mainPost){
            return {error: "El contenido no existe."}
        }

        return {
            thread: {
                post: mainPost,
                replies: replies
            }
        }
    } catch(err) {
        console.error(err)
        return {error: "No se pudo obtener el contenido."}
    }
}

