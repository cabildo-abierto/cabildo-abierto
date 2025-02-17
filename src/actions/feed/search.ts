import {getSessionDid} from "../auth";
import {db} from "../../db";
import {enDiscusionQuery} from "../utils";
import {FeedContentProps} from "../../app/lib/definitions";
import {addCountersToFeed} from "./utils";


export async function getSearchableContents(): Promise<{feed?: FeedContentProps[], error?: string}>{
    const did = await getSessionDid()

    let feed: FeedContentProps[] = await db.record.findMany({
        select: enDiscusionQuery,
        where: {
            collection: {
                in: ["ar.com.cabildoabierto.quotePost", "ar.com.cabildoabierto.article", "app.bsky.feed.post"]
            },
            author: {
                inCA: true
            }
        }
    })

    feed = addCountersToFeed(feed, did)

    return {feed}
}