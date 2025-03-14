'use server'

import { db } from "../../db";
import {
    FeedContentProps, FeedEngagementProps,
} from "../../app/lib/definitions";
import {getSessionAgent, getSessionDid} from "../auth";
import {
    enDiscusionQuery, logTimes
} from "../utils";
import {newestFirst} from "../../components/utils/utils";

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
        select: {
            ...enDiscusionQuery,
            reposts: {
                select: {
                    record: {
                        select: {
                            author: {
                                select: {
                                    did: true,
                                    displayName: true,
                                    handle: true,
                                    avatar: true
                                }
                            },
                            createdAt: true
                        }
                    }
                }
            }
        },
        where: {
            reposts: {
                some: {
                    record: {
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

    const [postsEngagement, repostsEngagement] = await Promise.all([getUserEngagementInFeed(posts, did), getUserEngagementInFeed(reposts, did)])

    let feed = [
        ...addCountersToFeed(posts, postsEngagement),
        ...addCountersToFeed(reposts.map(r => addReasonToRepost(r, following)), repostsEngagement)
    ]

    feed = feed.sort(newestFirst).slice(0, 50)

    const t4 = Date.now()

    logTimes("following feed CA time", [t1, t2, t3, t4])
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




export async function getUserEngagementInFeed(feed: {uri?: string}[], did: string): Promise<FeedEngagementProps> {
    const uris = feed.filter(({uri}) => uri).map(e => e.uri)

    const getLikes = db.like.findMany({
        select: {
            likedRecordId: true,
            uri: true
        },
        where: {
            record: {
                authorId: did
            },
            likedRecordId: {
                in: uris
            }
        }
    })

    const getReposts = db.repost.findMany({
        select: {
            repostedRecordId: true,
            uri: true
        },
        where: {
            record: {
                authorId: did
            },
            repostedRecordId: {
                in: uris
            }
        }
    })

    const [likes, reposts] = await Promise.all([getLikes, getReposts])

    return {likes, reposts}
}


export async function getEnDiscusion(): Promise<{feed?: FeedContentProps[], error?: string}> {
    const did = await getSessionDid()

    const t1 = Date.now()
    let feed = await getFeedCACached()
    const t2 = Date.now()
    const engagement = await getUserEngagementInFeed(feed, did)
    const t3 = Date.now()

    logTimes("En discusion", [t1, t2, t3])

    const readyForFeed = addCountersToFeed(feed, engagement)

    return {feed: readyForFeed}
}