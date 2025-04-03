'use server'

import {db} from "@/db";
import {
    ArticleProps,
    FastPostProps,
    FeedContentProps,
    FeedEngagementProps,
    TopicVersionProps,
} from "@/lib/definitions";
import {validQuotePost} from "@/utils/lexical";
import {addCountersToFeed} from "@/server-actions/feed/utils";


export async function getUserEngagement(feed: {uri?: string}[], did: string): Promise<FeedEngagementProps> {
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


export async function addViewerEngagementToFeed(did: string, feed: FeedContentProps[]) {
    const engagement = await getUserEngagement(feed, did)

    feed = feed.filter((r) => {
        if (r.collection == "ar.com.cabildoabierto.quotePost") {
            const post = r as FastPostProps
            return validQuotePost(((post.content.post.replyTo) as ArticleProps | TopicVersionProps).content, post)
        } else {
            return true
        }
    })

    const readyForFeed = addCountersToFeed(feed, engagement)
    return {feed: readyForFeed}
}