"use server"
import {FeedContentProps} from "@/lib/definitions";
import {getSessionDid} from "@/server-actions/auth";
import {logTimes} from "@/server-actions/utils";
import {addCountersToFeed} from "@/server-actions/feed/utils";
import {getUserEngagement} from "@/server-actions/feed/get-user-engagement";
import {db} from "@/db";
import {revalidateTag} from "next/cache";
import {hydrateFeedSkeleton} from "@/server-actions/feed/hydrate";



export async function getEnDiscusionSkeleton() {
    let result: { uri: string, replyToId?: string, rootId?: string }[] = await db.$queryRaw`
        SELECT r."uri", p."replyToId", p."rootId"
        FROM "Record" r
             JOIN "Content" c ON c."uri" = r."uri"
             LEFT JOIN "Post" p ON p."uri" = c."uri"
             LEFT JOIN "Record" root ON root."uri" = p."rootId"
        WHERE (
                  (
                      (
                          root."uri" IS NULL AND r."collection" IN ('ar.com.cabildoabierto.article', 'app.bsky.feed.post') AND r."enDiscusion" = TRUE
                      )
                      OR 
                      (
                          root."authorId" = r."authorId" AND root."collection" IN ('ar.com.cabildoabierto.article', 'app.bsky.feed.post') AND root."enDiscusion" = TRUE
                      )
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


export async function getEnDiscusion(): Promise<{feed?: FeedContentProps[], error?: string}> {
    const did = await getSessionDid()

    const t1 = Date.now()
    const skeleton = await getEnDiscusionSkeleton()
    let feed = await hydrateFeedSkeleton(skeleton)

    const t2 = Date.now()
    const engagement = await getUserEngagement(feed, did)
    const t3 = Date.now()

    logTimes("En discusion", [t1, t2, t3])

    const readyForFeed = addCountersToFeed(feed, engagement)

    return {feed: readyForFeed}
}



export async function addToEnDiscusion(uri: string){
    await db.record.update({
        data: {
            enDiscusion: true
        },
        where: {
            uri: uri
        }
    })
    revalidateTag("feedCA")
    return {}
}


export async function removeFromEnDiscusion(uri: string){
    await db.record.update({
        data: {
            enDiscusion: false
        },
        where: {
            uri: uri
        }
    })
    revalidateTag("feedCA")
    return {}
}