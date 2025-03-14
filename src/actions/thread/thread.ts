import {ThreadViewPost} from "@atproto/api/src/client/types/app/bsky/feed/defs";
import {FastPostProps, ThreadProps} from "../../app/lib/definitions";
import {getUri, validQuotePost} from "../../components/utils/utils";
import {getSessionAgent, getSessionDid} from "../auth";
import {unstable_cache} from "next/cache";
import {addCounters, revalidateEverythingTime, threadQuery, threadRepliesQuery} from "../utils";
import {isCAUser} from "../user/users";
import {db} from "../../db";
import {getTextFromBlob} from "../topic/topics";
import {getUserEngagementInFeed} from "../feed/inicio";


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
        if("notFound" in r && r.notFound || "blocked" in r && r.blocked) return null
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

    const uri = getUri(did, "app.bsky.feed.post", rkey)
    const {data} = await agent.getPostThread({
        uri
    })

    if(!("notFound" in data && data.notFound) && !("blocked" in data && data.blocked)){
        const thread = data.thread as ThreadViewPost

        return threadViewPostToThread(thread)
    } else {
        return {error: "No se encontró el post."}
    }
}


export async function getThreadFromCANoCache({did, rkey}: {did: string, rkey}) {
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

        if(!mainPost){
            return {error: "El contenido no existe."}
        }

        replies = replies.filter((r) => {
            return !r.content.post.quote || validQuotePost(mainPost.content, r)
        })

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


export async function getThreadFromCA({did, rkey}: {did: string, rkey}) {
    const viewerDid = await getSessionDid()

    const thread = await unstable_cache(
        async () => {
            return await getThreadFromCANoCache({did, rkey})
        },
        ["thread:"+did+":"+rkey],
        {
            tags: ["thread:"+did+":"+rkey],
            revalidate: revalidateEverythingTime
        }
    )()


    if(thread.thread){
        const engagement = await getUserEngagementInFeed([thread.thread.post, ...thread.thread.replies], viewerDid)
        return {
            thread: {
                post: addCounters(thread.thread.post, engagement),
                replies: thread.thread.replies.map((r) => {
                    return addCounters(r, engagement)
                })
            },
        }
    } else {
        return {error: thread.error}
    }
}


export async function getThread({did, rkey}: {did: string, rkey: string}): Promise<{thread?: ThreadProps, error?: string}> {
    const isCA = await isCAUser(did)
    if(!isCA){
        return await getThreadFromATProto({did, rkey})
    }

    return await getThreadFromCA({did, rkey})
}

