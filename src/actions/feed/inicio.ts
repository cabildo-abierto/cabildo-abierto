'use server'

import { db } from "../../db";
import {
    FeedContentProps,
} from "../../app/lib/definitions";
import {getSessionAgent, getSessionDid} from "../auth";
import {
    enDiscusionQuery,
    queryPostsFollowingFeedCA
} from "../utils";
import {popularityScore} from "../../components/popularity-score";
import {listOrder, listOrderDesc, newestFirst} from "../../components/utils";

import {getFollowing} from "../users";
import {addCountersToFeed, addReasonToRepost, joinCAandATFeeds} from "./utils";
import {getFeedCA, getFeedCACached} from "./feedCA";
import {FeedViewPost} from "@atproto/api/src/client/types/app/bsky/feed/defs";


export async function getFollowingFeedCA(did): Promise<{feed?: FeedContentProps[], error?: string}> {
    const following = [did, ...(await getFollowing(did))]

    const authorCond = {
        authorId: {
            in: following
        },
    }

    //const t1 = new Date().getTime()
    let postsQuery = getFeedCA(following)
    let repostsQuery = db.record.findMany({
        select: enDiscusionQuery,
        where: {
            reactions: {
                some: {
                    record: {
                        collection: "app.bsky.feed.repost",
                        ...authorCond
                    }
                }
            },
            collection: {
                in: ["ar.com.cabildoabierto.article", "ar.com.cabildoabierto.quotePost"]
            }
        },
    })

    const [posts, reposts] = await Promise.all([postsQuery, repostsQuery])

    //const t2 = new Date().getTime()
    //console.log("following feed query time", t2-t1)

    let feed = [
        ...addCountersToFeed(posts, did),
        ...addCountersToFeed(reposts, did).map((r) => (addReasonToRepost(r, following)))
    ]

    return {feed: feed.sort(newestFirst).slice(0, 50)}
}


export async function getFollowingFeed(){
    //const t1 = new Date().getTime()
    const {agent, did} = await getSessionAgent()
    //const t2 = new Date().getTime()

    if(!did){
        return {error: "No nos pudimos conectar con Bluesky."}
    }

    const feedCAPromise = getFollowingFeedCA(did)
    const timelinePromise = agent.getTimeline()

    const [feedCA, {data}] = await Promise.all([feedCAPromise, timelinePromise])
    //const t3 = new Date().getTime()

    function isRepost(r: FeedViewPost){
        return r.reason && (r.reason.$type == "app.bsky.feed.repost" || r.reason.$type == "app.bsky.feed.defs#reasonRepost")
    }

    const feedBsky = data.feed.filter((r) => {
        return isRepost(r) || (r.post.record as {reply?: any}).reply == undefined
    })

    let feed = joinCAandATFeeds(feedCA.feed, feedBsky)

    //console.log("session agent time", t2-t1)
    //console.log("timelines time", t3-t2)
    //console.log("following feed time", new Date().getTime() - t1)
    return {feed}
}


export async function getEnDiscusion(): Promise<{feed?: FeedContentProps[], error?: string}> {
    const did = await getSessionDid()
    let feed = await getFeedCACached()

    const readyForFeed = addCountersToFeed(feed, did)

    const sortedFeed = readyForFeed.map((e) => ({
        element: e as FeedContentProps,
        score: popularityScore(e as FeedContentProps)
    })).sort(listOrderDesc)

    return {feed: sortedFeed.map(({element}) => (element))}
}