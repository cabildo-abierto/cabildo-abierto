"use server"
import {FeedContentProps} from "@/lib/definitions";
import {getFollowing} from "@/server-actions/user/users";
import {db} from "@/db";
import {FeedSkeleton, FeedSkeletonElement} from "@/server-actions/feed/profile/main";
import {getSessionAgent} from "@/server-actions/auth";
import {getFeed} from "@/server-actions/feed/feed";
import {
    filterTimeline,
    removeRepeatedInSkeleton,
    rootCreationDateSortKey,
    skeletonElementFromFeedViewPost
} from "@/server-actions/feed/utils";
import {FeedViewPost} from "@atproto/api/src/client/types/app/bsky/feed/defs";

type RepostQueryResult = {
    author: {
        did: string,
        handle: string,
        displayName: string
    },
    createdAt: Date
    repost: {
        repostedRecord: {
            uri: string
            lastInThreadId?: string
            secondToLastInThreadId?: string
        }
    }
}


function skeletonFromArticleReposts(p: RepostQueryResult): FeedSkeletonElement {
    return {
        ...p.repost.repostedRecord,
        reason: {
            collection: "app.bsky.feed.repost",
            by: p.author,
            createdAt: p.createdAt
        }
    }
}


export async function getFollowingFeedSkeleton(did: string): Promise<FeedSkeleton> {
    const following = [did, ...(await getFollowing(did))]

    const {agent} = await getSessionAgent()
    const timelineQuery = agent.getTimeline({limit: 50})
    const articlesQuery = db.record.findMany({
        select: {
            uri: true,
            lastInThreadId: true,
            secondToLastInThreadId: true,
        },
        where: {
            authorId: {
                in: following
            },
            collection: {
                in: ["ar.com.cabildoabierto.article"]
            }
        }
    })
    const articleRepostsQuery: Promise<RepostQueryResult[]> = db.record.findMany({
        select: {
            author: {
                select: {
                    did: true,
                    displayName: true,
                    handle: true
                }
            },
            repost: {
                select: {
                    repostedRecord: {
                        select: {
                            uri: true,
                            lastInThreadId: true,
                            secondToLastInThreadId: true
                        }
                    },
                }
            },
            createdAt: true
        },
        where: {
            authorId: {
                in: following
            },
            collection: "app.bsky.feed.repost",
            repost: {
                repostedRecord: {
                    collection: "ar.com.cabildoabierto.article"
                }
            }
        }
    })

    const [timeline, articles, articleReposts] = await Promise.all([timelineQuery, articlesQuery, articleRepostsQuery])

    const timelineSkeleton = timeline.data.feed.filter(filterTimeline).map(skeletonElementFromFeedViewPost)
    const articleRepostsSkeleton = articleReposts.map(skeletonFromArticleReposts)

    return [
        ...removeRepeatedInSkeleton(timelineSkeleton),
        ...articles,
        ...articleRepostsSkeleton
    ]
}


export async function getFollowingFeed(): Promise<{feed?: FeedContentProps[], error?: string}> {
    return await getFeed({
        getSkeleton: getFollowingFeedSkeleton,
        sortKey: rootCreationDateSortKey
    })
}