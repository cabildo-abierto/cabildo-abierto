import {FeedContentProps} from "../../app/lib/definitions";
import {getSessionDid} from "../auth";
import {db} from "../../db";
import {feedQuery, threadRepliesQuery} from "../utils";
import {addCountersToFeed} from "./utils";


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
            orderBy: {
                createdAt: "desc"
            }
        })

        const readyForFeed = addCountersToFeed(feed, did)

        return {feed: readyForFeed}
    } catch (e) {
        console.log("Error getting topic feed for", id)
        console.log(e)
        return {error: "Ocurrió un error al obtener el feed del tema " + id}
    }
}