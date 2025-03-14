import {FeedContentProps} from "../../app/lib/definitions";
import {getSessionDid} from "../auth";
import {db} from "../../db";
import {threadRepliesQuery} from "../utils";
import {addCountersToFeed} from "./utils";
import {getUserEngagementInFeed} from "./inicio";


export async function getTopicFeed(id: string): Promise<{feed?: FeedContentProps[], error?: string}> {
    const did = await getSessionDid()

    id = decodeURIComponent(id)

    try {

        const feed = await db.record.findMany({
            select: threadRepliesQuery,
            where: {
                collection: {
                    in: ["app.bsky.feed.post", "ar.com.cabildoabierto.quotePost"]
                },
                OR: [{
                        content: {
                            post: {
                                replyTo: {
                                    collection: "ar.com.cabildoabierto.topic",
                                    content: {
                                        topicVersion: {
                                            topicId: id
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        content: {
                            references: {
                                some: {
                                    referencedTopicId: id
                                }
                            }
                        }
                    }
                ]
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        const engagement = await getUserEngagementInFeed(feed, did)
        const readyForFeed = addCountersToFeed(feed, engagement)

        return {feed: readyForFeed}
    } catch (e) {
        console.error("Error getting topic feed for", id)
        console.error(e)
        return {error: "Ocurrió un error al obtener el feed del tema " + id}
    }
}