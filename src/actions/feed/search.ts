"use server"
import {getSessionDid} from "../auth";
import {db} from "../../db";
import {enDiscusionQuery, revalidateEverythingTime} from "../utils";
import {ArticleProps, FastPostProps, FeedContentProps, SmallTopicProps} from "../../app/lib/definitions";
import {addCountersToFeed} from "./utils";
import {cleanText} from "../../components/utils/utils";
import {unstable_cache} from "next/cache";
import {getUserEngagementInFeed} from "./inicio";


export async function searchContentsNoCache(q: string, did: string): Promise<{feed?: FeedContentProps[], error?: string}>{

    q = cleanText(q)

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

    feed = feed.filter((c: FeedContentProps) => {
        if(c.collection == "app.bsky.feed.post"){
            if(!(c as FastPostProps).content){
                return false
            }
            const text = cleanText((c as FastPostProps).content.text)
            return text.includes(q)
        } else if(c.collection == "ar.com.cabildoabierto.article"){
            const text = cleanText((c as ArticleProps).content.article.title)
            return text.includes(q)
        } else {
            return false
        }
    })

    feed = feed.slice(0, 50)

    const engagement = await getUserEngagementInFeed(feed, did)
    feed = addCountersToFeed(feed, engagement)

    return {feed}
}


export async function getFullTopicList(){
    const topics: SmallTopicProps[] = await db.topic.findMany({
        select: {
            id: true,
            popularityScore: true,
            categories: {
                select: {
                    categoryId: true
                }
            },
            lastEdit: true,
            synonyms: true
        },
        where: {
            versions: {
                some: {}
            }
        }
    })
    return topics
}


export async function searchTopicsNoCache(q: string){
    q = cleanText(q)

    const getMatchScore = (topicId: string, query: string) => {
        const cleanedId = cleanText(topicId);
        const index = cleanedId.indexOf(query);

        if (index === -1) {
            return 0; // No match
        }

        const matchLength = query.length;
        const matchPosition = index;

        return 1 / (matchPosition + 1) + matchLength;
    }

    const topics: SmallTopicProps[] = await db.topic.findMany({
        select: {
            id: true,
            popularityScore: true,
            categories: {
                select: {
                    categoryId: true
                }
            },
            lastEdit: true,
            synonyms: true
        },
        where: {
            versions: {
                some: {}
            }
        }
    })

    const scoredTopics = topics.map((t) => ({
        topic: t,
        score: getMatchScore(t.id, q)
    }))
        .filter((scored) => scored.score > 0)
        .sort((a, b) => b.score - a.score)

    return scoredTopics.slice(0, 50).map(scored => scored.topic)
}



export async function searchTopics(q: string){
    if(q.length == 0) return []
    return unstable_cache(async () => {
        return await searchTopicsNoCache(q)
    }, ["searchTopics:"+q], {
        tags: ["searchTopics:"+q, "searchTopics"],
        revalidate: revalidateEverythingTime
    })()
}


export async function searchContents(q: string) : Promise<{feed?: FeedContentProps[], error?: string}> {
    const did = await getSessionDid()
    if(q.length == 0) return {feed: []}
    return unstable_cache(async () => {
        return await searchContentsNoCache(q, did)
    }, ["searchContents:"+q], {
        tags: ["searchContents:"+q],
        revalidate: revalidateEverythingTime
    })()
}