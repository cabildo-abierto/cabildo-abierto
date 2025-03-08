"use server"
import {SmallTopicProps} from "../../app/lib/definitions";
import {getDidFromUri} from "../../components/utils/utils";
import {db} from "../../db";


type ContentInteractions = {
    uri: string
    replies: {
        uri: string
    }[]
    reactions: {
        uri: string
    }[]
}

function getAllContentInteractions(uri: string,
                                   m: Map<string, ContentInteractions>,
                                   immediateInteractions: Map<string, Set<string>>
){
    const c = m.get(uri)
    const s = immediateInteractions.get(uri)

    c.replies.forEach((r) => {
        const rInteractions = getAllContentInteractions(r.uri, m, immediateInteractions)
        rInteractions.forEach((i) => {s.add(i)})
    })

    return s
}


function countTopicInteractions(topic: {id: string, referencedBy: {referencingContentId: string}[], versions: {uri: string}[]}, contentInteractions: Map<string, Set<string>>){
    const s = new Set<string>()

    topic.referencedBy.forEach(({referencingContentId}) => {
        const cInteractions = contentInteractions.get(referencingContentId)

        cInteractions.forEach((did) => {
            s.add(did)
        })
    })

    topic.versions.forEach((v) => {
        const cInteractions = contentInteractions.get(v.uri)

        cInteractions.forEach((did) => {
            s.add(did)
        })
    })

    const nonHumanUsers = [
        "did:plc:rup47j6oesjlf44wx4fizu4m"
    ]

    nonHumanUsers.forEach((nh) => {
        s.delete(nh)
    })

    return s.size
}


export async function computeTopicsPopularityScore(): Promise<{
    id: string, score: number}[]>{
    try {
        const contentInteractionsPromise = getContentInteractions()
        const topicsPromise = db.topic.findMany({
            select: {
                id: true,
                referencedBy: {
                    select: {
                        referencingContentId: true
                    }
                },
                versions: {
                    select: {
                        uri: true
                    }
                }
            }
        })

        const [contentInteractions, topics] = await Promise.all([contentInteractionsPromise, topicsPromise])

        const contentInteractionsMap = new Map<string, Set<string>>()
        contentInteractions.map(({uri, interactions}) => {
            contentInteractionsMap.set(uri, new Set<string>(interactions))
        })

        const topicScores = new Map<string, number>()
        for(let i = 0; i < topics.length; i++){
            const score = countTopicInteractions(topics[i], contentInteractionsMap)
            topicScores.set(topics[i].id, score)
        }

        return Array.from(topicScores.entries()).map(([id, score]) => {
            return {id, score}
        })
    } catch (err) {
        console.error("Error", err)
        return null
    }
}


function getTopicLastEdit(t: {versions: {content: {record: {createdAt: Date}}}[]}): Date{
    let last = undefined
    t.versions.forEach(v => {
        if(!last || last < v.content.record.createdAt) last = v.content.record.createdAt
    })
    return last
}


export async function getContentInteractions() : Promise<{uri: string, interactions: string[]}[]> {
    const contents: ContentInteractions[] = await db.record.findMany({
        select: {
            uri: true,
            replies: {
                select: {
                    uri: true
                }
            },
            reactions: {
                select: {
                    uri: true
                }
            }
        },
        where: {
            collection: {
                in: [
                    "ar.com.cabildoabierto.quotePost",
                    "ar.com.cabildoabierto.article",
                    "ar.com.cabildoabierto.post",
                    "app.bsky.feed.post",
                    "ar.com.cabildoabierto.topic"
                ]
            }
        }
    })
    const m = new Map<string, ContentInteractions>()

    const immediateInteractions = new Map<string, Set<string>>()
    for(let i = 0; i < contents.length; i++) {

        const s = new Set<string>()
        const c = contents[i]
        const author = getDidFromUri(c.uri)
        s.add(author)

        c.reactions.forEach(({uri}) => {
            const did = getDidFromUri(uri)
            s.add(did)
        })

        c.replies.forEach(({uri}) => {
            const did = getDidFromUri(uri)
            s.add(did)
        })

        immediateInteractions.set(c.uri, s)
        m.set(c.uri, contents[i])
    }

    const totalInteractions = new Map<string, Set<string>>()
    for(let i = 0; i < contents.length; i++) {
        const c = contents[i]
        const s = getAllContentInteractions(c.uri, m, immediateInteractions)
        totalInteractions.set(c.uri, s)
    }

    let r: {uri: string, interactions: string[]}[] = []
    totalInteractions.forEach((v, k) => {
        r.push({uri: k, interactions: Array.from(v)})
    })
    return r
}


export async function updateTopicPopularityScores() {
    const scores: { id: string, score: number }[] = (await computeTopicsPopularityScore()).map(
        ({ id, score }) => ({
            id: id,
            score: score
        })
    )

    scores.forEach((sc) => {
        if(sc.id == "Ley 24.591 (1995): Promoción 'postmortem'"){
            console.log(sc.id, sc.score)
        }
    })

    const t1 = Date.now();
    console.log("applying query with", scores.length, "items");

    // Construct the CASE statement dynamically
    const caseStatements = scores.map(({ id, score }, index) =>
        `WHEN "id" = $${index * 2 + 1} THEN $${index * 2 + 2}`
    ).join('\n');

    const query = `
        UPDATE "Topic"
        SET "popularityScore" = CASE
            ${caseStatements}
            ELSE "popularityScore"
            END
        WHERE "id" IN (${scores.map((_, index) => `$${index * 2 + 1}`).join(', ')});
    `;

    const params = scores.flatMap(({ id, score }) => [id, score]);

    await db.$queryRawUnsafe(query, ...params);

    console.log("done after", Date.now() - t1);
}