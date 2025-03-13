'use server'

import { db } from "../../db";
import {
    FeedContentProps,
} from "../../app/lib/definitions";
import {getSessionAgent, getSessionDid} from "../auth";
import {
    enDiscusionQuery
} from "../utils";
import {popularityScore} from "../../components/feed/popularity-score";
import {listOrderDesc, newestFirst} from "../../components/utils/utils";

import {getFollowing} from "../user/users";
import {addCountersToFeed, addReasonToRepost, joinCAandATFeeds} from "./utils";
import {getFeedCA, getFeedCACached} from "./feedCA";
import {FeedViewPost} from "@atproto/api/src/client/types/app/bsky/feed/defs";


export async function getFollowingFeedCA(did): Promise<{feed?: FeedContentProps[], error?: string}> {
    const t1 = Date.now()
    const following = [did, ...(await getFollowing(did))]
    const t2 = Date.now()

    const authorCond = {
        authorId: {
            in: following
        },
    }

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
    const t3 = Date.now()

    const [posts, reposts] = await Promise.all([postsQuery, repostsQuery])


    let feed = [
        ...addCountersToFeed(posts, did),
        ...addCountersToFeed(reposts, did).map((r) => (addReasonToRepost(r, following)))
    ]

    feed = feed.sort(newestFirst).slice(0, 50)

    const t4 = Date.now()

    // console.log("following feed CA time", t4-t1, "=", t2-t1, "+", t3-t2, "+", t4-t3)
    return {feed: feed}
}


export async function getFollowingFeed(){
    const t1 = Date.now()
    const {agent, did} = await getSessionAgent()
    const t2 = Date.now()

    if(!did){
        return {error: "No nos pudimos conectar con Bluesky."}
    }

    const feedCAPromise = getFollowingFeedCA(did)
    const timelinePromise = agent.getTimeline()

    const [feedCA, {data}] = await Promise.all([feedCAPromise, timelinePromise])
    const t3 = Date.now()

    function isRepost(r: FeedViewPost){
        return r.reason && (r.reason.$type == "app.bsky.feed.repost" || r.reason.$type == "app.bsky.feed.defs#reasonRepost")
    }

    const feedBsky = data.feed.filter((r) => {
        return isRepost(r) || (r.post.record as {reply?: any}).reply == undefined
    })

    let feed = joinCAandATFeeds(feedCA.feed, feedBsky)

    const t4 = Date.now()
    //console.log("Following feed time", t4-t1, "=", t2-t1, "+", t3-t2, "+", t4-t3)
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