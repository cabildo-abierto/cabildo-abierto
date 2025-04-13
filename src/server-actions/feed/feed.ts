"use server"
import {getSessionDid} from "@/server-actions/auth";
import {hydrateFeed} from "@/server-actions/feed/hydrate";
import {FeedContentProps} from "@/lib/definitions";
import {logTimes} from "@/server-actions/utils";
import {FeedSkeleton} from "@/server-actions/feed/profile/main";
import {listOrderDesc, sortByKey} from "@/utils/arrays";

type GetFeedProps = {
    getSkeleton: (did: string) => Promise<FeedSkeleton>
    sortKey: (a: FeedContentProps) => number[]
}

export async function getFeed({getSkeleton, sortKey}: GetFeedProps){
    const did = await getSessionDid()

    const t1 = Date.now()
    const skeleton = await getSkeleton(did)
    const t2 = Date.now()

    let feed = await hydrateFeed(skeleton)
    const t3 = Date.now()

    feed = sortByKey(feed, sortKey, listOrderDesc)

    logTimes("get feed", [t1, t2, t3])

    return {feed}
}