"use server"
import {db} from "@/db";
import {FastPostProps, FeedContentProps} from "@/lib/definitions";
import {enDiscusionQuery, logTimes} from "../utils";
import {isPost} from "@/utils/uri";


export async function hydrateFeedSkeleton(skeleton: {
    uri: string,
    replyToId?: string,
    rootId?: string
}[]): Promise<FeedContentProps[]> {
    const feedUris = skeleton.map(({uri}) => uri).filter((x) => (x != null))
    const feedUrisSet = new Set(feedUris)
    const uris = Array.from(new Set([
        ...feedUris,
        ...skeleton.map(({replyToId}) => replyToId),
        ...skeleton.map(({rootId}) => rootId)
    ])).filter((x) => (x != null))

    const t1 = Date.now()
    const records: FeedContentProps[] = await db.record.findMany({
        select: enDiscusionQuery,
        where: {
            uri: {
                in: uris
            }
        },
        orderBy: {
            createdAt: "desc"
        },
        take: 100
    })
    const t2 = Date.now()

    let recordsByUri = new Map<string, FeedContentProps>()
    for (let i = 0; i < records.length; i++) {
        recordsByUri.set(records[i].uri, records[i])
    }

    let feed = records.filter(({uri}) => feedUrisSet.has(uri))

    for (let i = 0; i < feed.length; i++) {
        if (isPost(feed[i].collection)) {
            const post = feed[i] as FastPostProps
            if (post.content.post.replyTo) {
                (feed[i] as FastPostProps).content.post.replyTo = {
                    ...recordsByUri.get(post.content.post.replyTo.uri),
                    uri: (feed[i] as FastPostProps).content.post.replyTo.uri
                }
            }
            if (post.content.post.root) {
                (feed[i] as FastPostProps).content.post.root = {
                    ...recordsByUri.get(post.content.post.root.uri),
                    uri: (feed[i] as FastPostProps).content.post.root.uri
                }
            }
        }
    }

    let roots = new Map<string, FeedContentProps>()
    for (let i = 0; i < feed.length; i++) {
        const post = feed[i] as FastPostProps
        const root = post.content && post.content.post && post.content.post.root ? post.content.post.root.uri : feed[i].uri
        if (!roots.has(root)) {
            roots.set(root, feed[i])
        } else {
            const cur = roots.get(root)
            if (feed[i].createdAt.getTime() > cur.createdAt.getTime()) {
                roots.set(root, feed[i])
            }
        }
    }

    logTimes("feed CA", [t1, t2])

    return Array.from(roots.values())
}