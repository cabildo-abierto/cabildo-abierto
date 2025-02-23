import {getSessionAgent} from "../auth";
import {addCountersToFeed, joinCAandATFeeds} from "./utils";
import {db} from "../../db";
import {FastPostProps, FeedContentProps} from "../../app/lib/definitions";
import {getDidFromUri, isPost} from "../../components/utils";
import {enDiscusionQuery, revalidateEverythingTime} from "../utils";
import {unstable_cache} from "next/cache";
import { Prisma } from "@prisma/client";

export async function getFeedCAForViewer(did: string, following?: string[], includeAllReplies: boolean = false){
    const feed = await getFeedCA(following, includeAllReplies)
    const readyForFeed = addCountersToFeed(feed, did)
    return {feed: readyForFeed}
}


export async function feedCAQuery(authors?: string[]) {
    let result: { uri: string, replyToId?: string, rootId?: string }[] = await db.$queryRaw`
        SELECT r."uri", p."replyToId", p."rootId"
        FROM "Record" r
                 JOIN "Content" c ON c."uri" = r."uri"
                 LEFT JOIN "Post" p ON p."uri" = c."uri"
                 LEFT JOIN "Record" root ON root."uri" = p."rootId"
        WHERE (
            root."uri" IS NULL AND r."collection" IN ('ar.com.cabildoabierto.article', 'app.bsky.feed.post')
                OR (root."authorId" = r."authorId" AND root."collection" IN ('ar.com.cabildoabierto.article', 'app.bsky.feed.post'))
            )
          AND ((${authors == undefined}) OR r."authorId" IN (${authors ? Prisma.join(authors) : ("")}))
          AND NOT EXISTS (
            SELECT 1
            FROM "Post" p_reply
                     JOIN "Record" r_reply ON r_reply."uri" = p_reply."uri"
            WHERE p_reply."replyToId" = r."uri"
              AND r_reply."authorId" = r."authorId"
        )
    `;
    return result;
}


export async function repliesFeedCAQuery(authors?: string[]){
    let result: { uri: string, replyToId?: string, rootId?: string }[] = await db.$queryRaw`
        SELECT r."uri", p."replyToId", p."rootId"
        FROM "Record" r
                 JOIN "Content" c ON c."uri" = r."uri"
                 LEFT JOIN "Post" p ON p."uri" = c."uri"
                 LEFT JOIN "Record" root ON root."uri" = p."rootId"
        WHERE (
            root."uri" IS NULL AND r."collection" IN ('ar.com.cabildoabierto.article', 'app.bsky.feed.post')
                OR (root."collection" IN ('ar.com.cabildoabierto.article', 'app.bsky.feed.post'))
            )
          AND ((${authors == undefined}) OR r."authorId" IN (${authors ? Prisma.join(authors) : ("")}))
          AND NOT EXISTS ( -- a reply that was not replied to by the same user
            SELECT 1
            FROM "Post" p_reply
                     JOIN "Record" r_reply ON r_reply."uri" = p_reply."uri"
            WHERE p_reply."replyToId" = r."uri"
              AND r_reply."authorId" = r."authorId"
        );
    `;
    return result
}


export async function getFeedCA(authors?: string[], includeAllReplies: boolean = false): Promise<FeedContentProps[]> {
    //const t1 = new Date().getTime()
    let result = includeAllReplies ? await repliesFeedCAQuery(authors) : await feedCAQuery(authors)
    //const t2 = new Date().getTime()

    const feedUris = result.map(({uri}) => uri).filter((x) => (x != null))
    const feedUrisSet = new Set(feedUris)
    const uris = Array.from(new Set([
        ...feedUris,
        ...result.map(({replyToId}) => replyToId),
        ...result.map(({rootId}) => rootId)
    ])).filter((x) => (x != null))

    const records: FeedContentProps[] = await db.record.findMany({
        select: enDiscusionQuery,
        where: {
            uri: {
                in: uris
            }
        }
    })

    let recordsByUri = new Map<string, FeedContentProps>()
    for(let i = 0; i < records.length; i++) {
        recordsByUri.set(records[i].uri, records[i])
    }

    //const t3 = new Date().getTime()

    let feed = records.filter(({uri}) => feedUrisSet.has(uri))

    for(let i = 0; i < feed.length; i++){
        if(isPost(feed[i].collection)){
            const post = feed[i] as FastPostProps
            if(post.content.post.replyTo){
                (feed[i] as FastPostProps).content.post.replyTo = recordsByUri.get(post.content.post.replyTo.uri)
            }
            if(post.content.post.root){
                (feed[i] as FastPostProps).content.post.root = recordsByUri.get(post.content.post.root.uri)
            }
        }
    }

    let roots = new Map<string, FeedContentProps>()
    for(let i = 0; i < feed.length; i++) {
        const post = feed[i] as FastPostProps
        const root = post.content && post.content.post && post.content.post.root ? post.content.post.root.uri : feed[i].uri
        if(!roots.has(root)){
            roots.set(root, feed[i])
        } else {
            const cur = roots.get(root)
            if(feed[i].createdAt.getTime() > cur.createdAt.getTime()){
                roots.set(root, feed[i])
            }
        }
    }

    return Array.from(roots.values())
}


export const getFeedCACached = async () => {

    return await unstable_cache(async () => {
            return await getFeedCA()
        },
        ["feedCA"],
        {
            tags: ["feedCA"],
            revalidate: revalidateEverythingTime
        }
    )()
}