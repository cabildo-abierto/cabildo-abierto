import {ThreadViewPost} from "@atproto/api/src/client/types/app/bsky/feed/defs";
import {FastPostProps, ThreadProps} from "../../app/lib/definitions";
import {Agent} from "@atproto/api";
import {getUri} from "../../components/utils";
import {getSessionAgent} from "../auth";
import {unstable_cache} from "next/cache";
import {addCounters, feedQuery, revalidateEverythingTime, threadQuery, threadRepliesQuery} from "../utils";
import {getUsers} from "../users";
import {db} from "../../db";


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


export async function getThreadFromATProto({agent, did, rkey}: {agent: Agent, did: string, rkey: string}) {

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

    const {agent, did: viewerDid} = await getSessionAgent()

    return await unstable_cache(
        async () => {
            const r = await getThreadNoCache({did, viewerDid, rkey, agent})
            return r
        },
        ["thread:"+did+":"+rkey+":"+viewerDid],
        {
            tags: [
                "thread",
                "thread:"+did+":"+rkey,
                "thread:"+did+":"+rkey+":"+viewerDid
            ],
            revalidate: revalidateEverythingTime
        }
    )()
}


export async function getThreadNoCache({did, rkey, viewerDid, agent}: {did: string, rkey: string, viewerDid: string, agent: Agent}): Promise<{thread?: ThreadProps, error?: string}> {

    const {users, error} = await getUsers()
    if(error) return {error}
    if(!users.some((u) => (u.did == did))){
        return await getThreadFromATProto({agent, did, rkey})
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
        const [mainPost, replies] = await Promise.all([mainPostQ, repliesQ])

        const threadForFeed: ThreadProps = {
            post: addCounters(viewerDid, mainPost),
            replies: replies.map((r) => {
                return addCounters(viewerDid, r)
            })
        }

        return {thread: threadForFeed}
    } catch(err) {
        console.log(err)
        return {error: "No se pudo obtener el thread."}
    }
}