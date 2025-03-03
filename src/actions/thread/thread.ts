import {ThreadViewPost} from "@atproto/api/src/client/types/app/bsky/feed/defs";
import {FastPostProps, ThreadProps} from "../../app/lib/definitions";
import {Agent} from "@atproto/api";
import {getUri, validQuotePost} from "../../components/utils/utils";
import {getSessionAgent, getSessionDid} from "../auth";
import {unstable_cache} from "next/cache";
import {addCounters, feedQuery, revalidateEverythingTime, threadQuery, threadRepliesQuery} from "../utils";
import {getUsers, isCAUser} from "../users";
import {db} from "../../db";
import {getTextFromBlob} from "../topics";


function threadViewPostToThread(thread: ThreadViewPost) {
    const record = thread.post.record as {createdAt: string, text: string, facets?: any, embed?: any}

    const post: FastPostProps = {
        uri: thread.post.uri,
        cid: thread.post.cid,
        author: thread.post.author,
        collection: "app.bsky.feed.post",
        createdAt: new Date(record.createdAt),
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
        if(r.notFound || r.blocked) return null
        const replyThread = r as ThreadViewPost
        if(replyThread.$type == "app.bsky.feed.defs#threadViewPost"){
            return threadViewPostToThread(replyThread).thread.post
        } else {
            return null
        }
    }).filter((r) => (r != null)) : []

    return {thread: {post, replies}}
}


export async function getThreadFromATProto({did, rkey}: {did: string, rkey: string}) {
    const {agent} = await getSessionAgent()

    const {data} = await agent.getPostThread({
        uri: getUri(did, "app.bsky.feed.post", rkey)
    })

    if(!data.notFound && !data.blocked){
        const thread = data.thread as ThreadViewPost

        return threadViewPostToThread(thread)
    } else {
        return {error: "No se encontró el post."}
    }
}


export async function getThread({did, rkey}: {did: string, rkey: string}): Promise<{thread?: ThreadProps, error?: string}> {
    const viewerDid = await getSessionDid()
    return await getThreadNoCache({did, rkey, viewerDid})
}


export async function getThreadNoCache({did, rkey, viewerDid}: {did: string, rkey: string, viewerDid: string}): Promise<{thread?: ThreadProps, error?: string}> {
    if(!isCAUser(did)){
        return await getThreadFromATProto({did, rkey})
    }

    const threadId = {rkey, authorId: did}

    try {
        const mainPostQ = db.record.findFirst({
            select: threadQuery,
            where: threadId
        })
        const repliesQ = db.record.findMany({
            select: threadRepliesQuery,
            where: {
                content: {
                    post: {
                        replyTo: threadId
                    }
                }
            }
        })

        let [mainPost, replies] = await Promise.all([mainPostQ, repliesQ])

        if(mainPost.content && !mainPost.content.text){
            mainPost.content.text = await getTextFromBlob(mainPost.content.textBlob)
        }

        for(let i = 0; i < replies.length; i++){
            if(replies[i].collection == "ar.com.cabildoabierto.quotePost"){
                replies[i].content.post.replyTo.content.text = mainPost.content.text
            }
        }

        replies = replies.filter((r) => {
            return !r.content.post.quote || validQuotePost(mainPost.content, r)
        })

        if(!mainPost){
            return {error: "El contenido no existe."}
        }

        const threadForFeed: ThreadProps = {
            post: addCounters(viewerDid, mainPost, replies),
            replies: replies.map((r) => {
                return addCounters(viewerDid, r)
            })
        }
        return {thread: threadForFeed}
    } catch(err) {
        console.error(err)
        return {error: "No se pudo obtener el contenido."}
    }
}