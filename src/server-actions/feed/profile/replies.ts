"use server"
import {FeedContentProps} from "@/lib/definitions";
import {getSessionAgent} from "@/server-actions/auth";
import {joinCAandATFeeds} from "@/server-actions/feed/utils";
import {hydrateFeedSkeleton} from "@/server-actions/feed/hydrate";
import {db} from "@/db";
import {addViewerEngagementToFeed} from "@/server-actions/feed/get-user-engagement";


export async function getRepliesFeedCASkeleton(did: string){
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
            )
          AND (r."authorId" = ${did})
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


export async function getRepliesFeedCA(did: string, loggedInDid: string){
    const skeleton = await getRepliesFeedCASkeleton(did)
    let feedCA = await hydrateFeedSkeleton(skeleton)
    feedCA = (await addViewerEngagementToFeed(loggedInDid, feedCA)).feed

    return feedCA
}


export async function getRepliesProfileFeed(did: string): Promise<{feed?: FeedContentProps[], error?: string}>{
    const {did: loggedInDid, agent} = await getSessionAgent()

    if(!did.startsWith("did")){
        did = (await agent.resolveHandle({handle: did})).data.did
    }

    const promiseFeedCA = getRepliesFeedCA(did, loggedInDid)
    const promiseFeedAT = agent.getAuthorFeed({actor: did, filter: "posts_no_replies"})

    const [feedCA, feedAT] = await Promise.all([promiseFeedCA, promiseFeedAT])

    const feed = joinCAandATFeeds(feedCA, feedAT.data.feed)
    return {feed}
}