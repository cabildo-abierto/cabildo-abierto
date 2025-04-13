"use server"
import {ReasonProps} from "@/lib/definitions";
import {
    removeRepeatedInSkeleton,
    rootCreationDateSortKey,
    skeletonElementFromFeedViewPost
} from "@/server-actions/feed/utils";
import {db} from "@/db";
import {getFeed} from "@/server-actions/feed/feed";
import {getSessionAgent} from "@/server-actions/auth";
import { concat } from "@/utils/arrays";


export type FeedSkeletonElement = {
    uri: string,
    lastInThreadId?: string,
    secondToLastInThreadId?: string
    reason?: ReasonProps
}


export type FeedSkeleton = FeedSkeletonElement[]


export async function getMainProfileFeedSkeletonBsky(did: string): Promise<FeedSkeleton> {
    const {agent} = await getSessionAgent()
    const feed = await agent.getAuthorFeed({actor: did, filter: "posts_and_author_threads"})

    return removeRepeatedInSkeleton(feed.data.feed.map(skeletonElementFromFeedViewPost))
}


export async function getMainProfileFeedSkeletonCA(did: string): Promise<FeedSkeleton> {
    const res = await db.record.findMany({
        select: {
            uri: true,
            lastInThreadId: true,
            secondToLastInThreadId: true
        },
        where: {
            authorId: did,
            collection: "ar.com.cabildoabierto.article"
        }
    })

    console.log("article skeletons", did, res)
    return res
}


export async function getMainProfileFeedSkeleton(did: string): Promise<FeedSkeleton> {
    return concat(await Promise.all([
        getMainProfileFeedSkeletonBsky(did),
        getMainProfileFeedSkeletonCA(did)
    ]))
}


export async function getMainProfileFeed(did: string){
    return await getFeed({
        getSkeleton: async () => {return await getMainProfileFeedSkeleton(did)},
        sortKey: rootCreationDateSortKey
    })
}