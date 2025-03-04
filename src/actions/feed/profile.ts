import {getSessionAgent} from "../auth";
import {FeedContentProps} from "../../app/lib/definitions";
import {joinCAandATFeeds} from "./utils";
import {getFeedCAForViewer} from "./feedCA";
import {db} from "../../db";
import {recordQuery} from "../utils";


export async function getMainProfileFeed(did: string): Promise<{feed?: FeedContentProps[], error?: string}>{
    const {did: loggedInDid, agent} = await getSessionAgent()

    if(!did.startsWith("did")){
        did = (await agent.resolveHandle({handle: did})).data.did
    }

    const promiseFeedCA = getFeedCAForViewer(loggedInDid, [did], false)

    const promiseFeedAT = agent.getAuthorFeed({actor: did, filter: "posts_no_replies"})
    const [feedCA, feedAT] = await Promise.all([promiseFeedCA, promiseFeedAT])

    const feed = joinCAandATFeeds(feedCA.feed, feedAT.data.feed)
    return {feed}
}


export async function getRepliesProfileFeed(did: string): Promise<{feed?: FeedContentProps[], error?: string}>{
    const {did: loggedInDid, agent} = await getSessionAgent()

    if(!did.startsWith("did")){
        did = (await agent.resolveHandle({handle: did})).data.did
    }

    const promiseFeedCA = getFeedCAForViewer(loggedInDid, [did], true)

    const promiseFeedAT = agent.getAuthorFeed({actor: did, filter: "posts_no_replies"})
    const [feedCA, feedAT] = await Promise.all([promiseFeedCA, promiseFeedAT])

    const feed = joinCAandATFeeds([], feedAT.data.feed)
    return {feed}
}


export async function getEditsProfileFeed(userId: string): Promise<{feed?: FeedContentProps[], error?: string}>{
    const edits: FeedContentProps[] = await db.record.findMany({
        select: {
            ...recordQuery,
            content: {
                select: {
                    topicVersion: {
                        select: {
                            topic: {
                                select: {
                                    id: true,
                                    versions: {
                                        select: {
                                            title: true,
                                            categories: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        where: {
            authorId: userId,
            collection: "ar.com.cabildoabierto.topic"
        }
    })
    return {feed: edits}
}


export async function getProfileFeed(userId: string, kind: "main" | "replies" | "edits"): Promise<{error?: string, feed?: FeedContentProps[]}>{

    if(kind == "main"){
        return await getMainProfileFeed(userId)
    } else if(kind == "replies"){
        return await getRepliesProfileFeed(userId)
    } else if(kind == "edits"){
        return await getEditsProfileFeed(userId)
    } else {
        throw Error("Not implemented")
    }
}