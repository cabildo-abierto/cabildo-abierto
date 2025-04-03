"use server"
import {getSessionAgent} from "@/server-actions/auth";
import {FeedViewPost} from "@atproto/api/src/client/types/app/bsky/feed/defs";
import {addCountersToFeed, addReasonToRepost, joinCAandATFeeds} from "@/server-actions/feed/utils";
import {enDiscusionQuery, logTimes} from "@/server-actions/utils";
import {getUserEngagement} from "@/server-actions/feed/get-user-engagement";
import {FeedContentProps} from "@/lib/definitions";
import {getFollowing} from "@/server-actions/user/users";
import {db} from "@/db";
import {newestFirst} from "@/utils/arrays";
import {Prisma} from "@prisma/client";
import {hydrateFeedSkeleton} from "@/server-actions/feed/hydrate";


export async function getFollowingFeedSkeleton(following: string[]) {
    let result: { uri: string, replyToId?: string, rootId?: string }[] = await db.$queryRaw`
        SELECT r."uri", p."replyToId", p."rootId"
        FROM "Record" r
                 JOIN "Content" c ON c."uri" = r."uri"
                 LEFT JOIN "Post" p ON p."uri" = c."uri"
                 LEFT JOIN "Record" root ON root."uri" = p."rootId"
        WHERE (
                  (
                      (
                          root."uri" IS NULL AND
                          r."collection" IN ('ar.com.cabildoabierto.article', 'app.bsky.feed.post')
                      )
                          OR
                      (
                          root."authorId" = r."authorId" AND
                          root."collection" IN ('ar.com.cabildoabierto.article', 'app.bsky.feed.post')
                      )
                  )
            AND 
                (
                    r."authorId" IN (${following ? Prisma.join(following) : ("")})
                )
            AND (
                    NOT EXISTS (SELECT 1
                                FROM "Post" p_reply
                                         JOIN "Record" r_reply ON r_reply."uri" = p_reply."uri"
                                WHERE p_reply."replyToId" = r."uri"
                                  AND r_reply."authorId" = r."authorId")
            )
        )
    `;
    return result
}


export async function getPostsForFollowingFeedCA(following: string[]){
    const skeleton = await getFollowingFeedSkeleton(following)
    return await hydrateFeedSkeleton(skeleton)
}


export async function getFollowingFeedCA(did: string): Promise<{feed?: FeedContentProps[], error?: string}> {
    const t1 = Date.now()
    const following = [did, ...(await getFollowing(did))]
    const t2 = Date.now()

    const authorCond = {
        authorId: {
            in: following
        },
    }

    let postsQuery = getPostsForFollowingFeedCA(following)
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

    const [postsEngagement, repostsEngagement] = await Promise.all([getUserEngagement(posts, did), getUserEngagement(reposts, did)])

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
    logTimes("Following feed time", [t1, t2, t3, t4])
    return {feed}
}
