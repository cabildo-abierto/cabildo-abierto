"use server"
import {hydrateFeedSkeleton} from "@/server-actions/feed/hydrate";
import {FeedContentProps} from "@/lib/definitions";
import {getSessionAgent} from "@/server-actions/auth";
import {joinCAandATFeeds} from "@/server-actions/feed/utils";
import {db} from "@/db";
import {addViewerEngagementToFeed} from "@/server-actions/feed/get-user-engagement";


export async function getMainProfileFeedSkeleton(did: string) {
    let result: { uri: string, replyToId?: string, rootId?: string }[] = await db.$queryRaw`
            SELECT r."uri", p."replyToId", p."rootId"
            FROM "Record" r
                     JOIN "Content" c ON c."uri" = r."uri"
                     LEFT JOIN "Post" p ON p."uri" = c."uri"
                     LEFT JOIN "Record" root ON root."uri" = p."rootId"
            WHERE 
                (
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
                        r."authorId" = ${did}
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



export async function getMainProfileFeedCA(did: string, loggedInDid: string){
    const skeleton = await getMainProfileFeedSkeleton(did)
    let feedCA = await hydrateFeedSkeleton(skeleton)
    feedCA = (await addViewerEngagementToFeed(loggedInDid, feedCA)).feed

    console.log("main profile feed", did, feedCA)

    return feedCA
}


export async function getMainProfileFeed(did: string): Promise<{feed?: FeedContentProps[], error?: string}>{
    const {did: loggedInDid, agent} = await getSessionAgent()

    if(!did.startsWith("did")){
        did = (await agent.resolveHandle({handle: did})).data.did
    }

    const [feedCA, feedAT] = await Promise.all([
        getMainProfileFeedCA(did, loggedInDid),
        agent.getAuthorFeed({actor: did, filter: "posts_no_replies"})
    ])

    const feed = joinCAandATFeeds(feedCA, feedAT.data.feed)
    return {feed}
}