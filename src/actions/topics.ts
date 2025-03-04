"use server"

import {getSessionAgent} from "./auth";
import {
    TopicProps,
    TopicVersionProps,
    SmallTopicProps,
    TopicsGraph,
} from "../app/lib/definitions";
import {db} from "../db";
import {
    currentCategories,
    getDidFromUri,
    getRkeyFromUri,
    listOrderDesc,
    newestFirst,
} from "../components/utils/utils";
import {Prisma} from ".prisma/client";
import SortOrder = Prisma.SortOrder;
import {recordQuery, revalidateEverythingTime} from "./utils";
import {fetchBlob} from "./data";
import {unstable_cache} from "next/cache";
import {getCurrentContentVersion} from "../components/topic/utils";



const smallRecordQuery = {
    createdAt: true,
    authorId: true
}


const topicVersionReactionsQuery = {
    select: {
        reactsTo: {
            select: {
                cid: true,
                uri: true,
                createdAt: true,
                authorId: true
            }
        },
    },
    where: {
        record: {
            collection: {
                in: ["ar.com.cabildoabierto.topic.accept", "ar.com.cabildoabierto.topic.reject"]
            }
        }
    }
}


type TopicUserInteractionsProps = {
    id: string
    referencedBy: {
        referencingContent: {
            record: {
                createdAt: Date
                authorId: string
                rootOf: {
                    content: {
                        record: {
                            createdAt: Date
                            authorId: string
                            reactions: {
                                record: {
                                    createdAt: Date
                                    authorId: string
                                }
                            }[]
                        }
                    }
                }[]
                reactions: {
                    record: {
                        createdAt: Date
                        authorId: string
                    }
                }[]
            }
        }
    }[]
    versions: {
        title?: string
        categories?: string
        content: {
            numWords?: number
            record: {
                authorId: string
                createdAt: Date
                rootOf: {
                    content: {
                        record: {
                            createdAt: Date
                            authorId: string
                            reactions: {
                                record: {
                                    createdAt: Date
                                    authorId: string
                                }
                            }[]
                        }
                    }
                }[]
            }
        }
    }[]
}


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


type SmallTopicPropsWithReferences = SmallTopicProps & {referencedBy: {referencingContentId: string}[]}


export async function getTopicsNoCache(): Promise<SmallTopicPropsWithReferences[]> {
    let r = await db.topic.findMany({
        select: {
            id: true,
            referencedBy: {
                select: {
                    referencingContentId: true
                }
            },
            versions: {
                select: {
                    uri: true,
                    title: true,
                    categories: true,
                    content: {
                        select: {
                            record: {
                                select: {
                                    createdAt: true,
                                    author: {
                                        select: {
                                            handle: true
                                        }
                                    },
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    r = r.filter((t) => (t.versions.length > 0))
    return r
}


function countTopicInteractions(topic: SmallTopicPropsWithReferences, contentInteractions: Map<string, Set<string>>){
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


function getTopicPopularityScore(
    topic: SmallTopicPropsWithReferences,
    contentInteractions: Map<string, Set<string>>
) {
    const interactions = countTopicInteractions(topic, contentInteractions)
    const currentContentVersion = getCurrentContentVersion(topic)
    const currentContent = topic.versions[currentContentVersion]
    const lastVersion = getTopicLastEdit(topic)
    return [
        interactions,
        currentContent.content.numWords > 0 ? 1 : 0,
        lastVersion ? lastVersion.getTime() : 0
    ]
}

function getTopicLastEdit(t: {versions: {content: {record: {createdAt: Date}}}[]}): Date{
    let last = undefined
    t.versions.forEach(v => {
        if(!last || last < v.content.record.createdAt) last = v.content.record.createdAt
    })
    return last
}

export async function getTrendingTopics(categories: string[],
                                        sortedBy: string,
                                        limit: number){
    // no se puede cachear porque (no sé por qué) no se puede anidar unstable_cache
    return await getTrendingTopicsNoCache(categories, sortedBy, limit)
}


export async function getTrendingTopicsNoCache(
    categories: string[],
    sortedBy: string,
    limit: number): Promise<{
    error?: string
    topics?: SmallTopicProps[]
}> {
    try {
        const t1 = Date.now()
        const scoreMap = await getTopicsPopularityScoreMap()
        const t2 = Date.now()
        let scoreList = Array.from(scoreMap)

        scoreList = scoreList.filter((t) => {
            if(categories.length == 0) return true
            return !categories.some((c) => {
                return !t[1].categories.includes(c)
            });
        })

        let firstK: string[]
        if(sortedBy == "popular"){
            firstK = sortTopicsByPopularity(scoreList).slice(0, limit).map(([id, score]) => (id))
        } else {
            firstK = sortTopicsByLastEdit(scoreList).slice(0, limit).map(([id, score]) => (id))
        }

        let topics = await db.topic.findMany({
            select: {
                id: true,
                versions: {
                    select: {
                        uri: true,
                        title: true,
                        categories: true,
                        content: {
                            select: {
                                numWords: true,
                                record: {
                                    select: {
                                        createdAt: true,
                                        author: {
                                            select: {
                                                handle: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            where: {
                id: {
                    in: firstK
                }
            }
        })
        const t3 = Date.now()

        const topicsMap = new Map<string, SmallTopicProps>()
        for(let topic of topics) {
            topicsMap.set(topic.id, topic)
        }

        const firstKWithTopics: SmallTopicProps[] = []

        firstK.forEach((id) => {
            firstKWithTopics.push({...topicsMap.get(id), score: scoreMap.get(id).score})
        })

        return {topics: firstKWithTopics}
    } catch (err) {
        console.error("Error", err)
        return {error: "Error al buscar los temas."}
    }
}


const topicQuery = {
    id: true,
    protection: true,
    versions: {
        select: {
            uri: true
        }
    }
}


const topicVersionQuery = {
    ...recordQuery,
    content: {
        select: {
            text: true,
            textBlob: {
                select: {
                    authorId: true,
                    cid: true
                }
            },
            topicVersion: {
                select: {
                    topicId: true,
                    message: true,
                    title: true,
                    diff: true,
                    charsAdded: true,
                    accCharsAdded: true,
                    contribution: true,
                    authorship: true,
                }
            }
        }
    },
    reactions: {
        select: {
            record: {
                select: {
                    authorId: true,
                    collection: true
                }
            }
        },
        where: {
            reactsTo: {
                collection: {
                    in: ["ar.com.cabildoabierto.topic.accept", "ar.com.cabildoabierto.topic.reject"]
                }
            }
        }
    }
}


const topicQueryOld = {
    id: true,
    protection: true,
    versions: {
        select: {
            uri: true,
            categories: true,
            synonyms: true,
            topicId: true,
            title: true,
            message: true,
            diff: true,
            charsAdded: true,
            accCharsAdded: true,
            contribution: true,
            authorship: true,
            content: {
                select: {
                    text: true,
                    textBlob: {
                        select: {
                            cid: true,
                            authorId: true
                        }
                    },
                    format: true,
                    record: {
                        select: {
                            createdAt: true,
                            cid: true,
                            uri: true,
                            author: {
                                select: {
                                    did: true,
                                    handle: true,
                                    avatar: true,
                                    displayName: true
                                }
                            },
                            reactions: {
                                select: {
                                    record: {
                                        select: {
                                            authorId: true,
                                            collection: true
                                        }
                                    }
                                },
                                where: {
                                    reactsTo: {
                                        collection: {
                                            in: ["ar.com.cabildoabierto.topic.accept", "ar.com.cabildoabierto.topic.reject"]
                                        }
                                    }
                                }
                            }
                        }
                    },
                }
            },
        },
        orderBy: {
            content: {
                record: {
                    createdAt: "asc" as SortOrder
                }
            }
        }
    }
}


export async function getCategories() {
    return await unstable_cache(async () => {
        return await getCategoriesNoCache()
    },
        ["categories"],
        {
            tags: ["categories"],
            revalidate: revalidateEverythingTime
        }
    )()
}

const cabildoDid = "did:plc:rup47j6oesjlf44wx4fizu4m"

export async function getCategoriesNoCache() {
    const topics = await db.topic.findMany({
        select: {
            versions: {
                select: {
                    categories: true,
                    uri: true,
                    content: {
                        select: {
                            record: {
                                select: {
                                    createdAt: true
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    let categories = new Set<string>()
    for(let i = 0; i < topics.length; i++){
        const current = currentCategories(topics[i])
        for(let j = 0; j < current.length; j++){
            categories.add(current[j])
        }
    }

    function countManualEdits(t: {versions: {uri: string}[]}){
        let c = 0
        t.versions.forEach((v) => {
            if(getDidFromUri(v.uri) != cabildoDid){
                c ++
            }
        })
        return c
    }

    let score = new Map<string, number>(Array.from(categories).map((c) => [c, 0]))
    for(let i = 0; i < topics.length; i++){
        const count = countManualEdits(topics[i])
        const current = currentCategories(topics[i])
        for(let j = 0; j < current.length; j++){
            score.set(current[j], score.get(current[j])+count)
        }
    }

    function cmp(a: string, b: string){
        return score.get(b) - score.get(a)
    }

    return Array.from(categories).sort(cmp)
}


export async function getTextFromBlob(blob: {cid: string, authorId: string}){
    try {
        const response = await fetchBlob(blob)
        if(!response.ok) return null
        const responseBlob = await response.blob()
        if(!responseBlob) return null
        return await responseBlob.text()
    } catch (e) {
        console.error("Error getting text from blob", blob)
        console.error(e)
        return null
    }
}


export async function getTopicById(id: string): Promise<{topic?: TopicProps, error?: string}>{

    const t1 = Date.now()
    const {topic, error} = await unstable_cache(async () => {
        const topic = await db.topic.findUnique({
            select: topicQuery,
            where: {
                id: id
            }
        })
        if(!topic) return {error: "No se encontró el tema " + id + "."}

        return {topic}
    }, ["topic:"+id], {
        tags: ["topic:"+id],
        revalidate: revalidateEverythingTime
    })()

    const t2 = Date.now()
    if(error){
        return {error}
    }

    const topicWithVersions: TopicProps = {
        ...topic,
        versions: []
    }

    for(let i = 0; i < topic.versions.length; i++){
        const {topicVersion, error} = await getTopicVersion(topic.versions[i].uri)
        if(error) return {error}
        topicWithVersions.versions.push(topicVersion)
    }
    const t3 = Date.now()

    topicWithVersions.versions = topicWithVersions.versions.sort(newestFirst)


    const version = getCurrentContentVersion(topicWithVersions)
    if(topicWithVersions.versions[version].content.textBlob != undefined){
        topicWithVersions.versions[version].content.text = await getTextFromBlob(topicWithVersions.versions[version].content.textBlob)
    }
    const t4 = Date.now()

    // console.log("Getting topic", id, "time:", t4-t1, "=", t2-t1, "+", t3-t2, "+", t4-t3)

    return {topic: topicWithVersions}
}


export async function getTopicVersionNoCache(uri: string){
    try {
        const topicVersion: TopicVersionProps = await db.record.findUnique({
            select: topicVersionQuery,
            where: {
                uri: uri
            }
        })

        return {topicVersion}
    } catch {
        return {error: "No se encontró el tema."}
    }
}


export const getTopicVersion = unstable_cache(
    getTopicVersionNoCache,
    undefined,
    {
        tags: ["topics"],
        revalidate: revalidateEverythingTime
    }
)


export async function deleteTopicVersionsForUser(){
    const {agent, did} = await getSessionAgent()

    const {data} = await agent.com.atproto.repo.listRecords({
        repo: did,
        collection: 'ar.com.cabildoabierto.topic',
    })

    for(let i = 0; i < data.records.length; i++){
        await agent.com.atproto.repo.deleteRecord({
            repo: did,
            collection: 'ar.com.cabildoabierto.topic',
            rkey: getRkeyFromUri(data.records[i].uri)
        })
        console.error("deleted", data.records[i].uri)
    }
}


export async function getCategoriesGraphNoCache(): Promise<TopicsGraph> {
    let topics = await db.topic.findMany({
        select: {
            id: true,
            versions: {
                select: {
                    categories: true,
                    content: {
                        select: {
                            record: {
                                select: {
                                    createdAt: true
                                }
                            }
                        }
                    }
                }
            },
            referencedBy: {
                select: {
                    referencingContent: {
                        select: {
                            topicVersion: {
                                select: {
                                    topicId: true
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    const topicToCategoriesMap = new Map<string, string[]>()

    const categories = new Map<string, number>()
    for(let i = 0; i < topics.length; i++) {
        const cats = currentCategories(topics[i])
        topicToCategoriesMap.set(topics[i].id, cats)
        cats.forEach((c) => {
            if(!categories.has(c)) categories.set(c, 1)
            else categories.set(c, categories.get(c)+1)
        })
    }

    const edges: {x: string, y: string}[] = []
    for(let i = 0; i < topics.length; i++) {
        const yId = topics[i].id
        const catsY = topicToCategoriesMap.get(yId)

        for(let j = 0; j < topics[i].referencedBy.length; j++){
            if(topics[i].referencedBy[j].referencingContent.topicVersion){
                const xId = topics[i].referencedBy[j].referencingContent.topicVersion.topicId
                const catsX = topicToCategoriesMap.get(xId)

                catsX.forEach((catX) => {
                    catsY.forEach((catY) => {
                        if(catX != catY && !edges.some(({x, y}) => (x == catX && y == catY))){
                            edges.push({x: catX, y: catY})
                        }
                    })
                })
            }
        }
    }

    const nodeLabels = new Map<string, string>()
    Array.from(categories.entries()).forEach(([cat, k]) => {
        nodeLabels.set(cat, cat + " (" + k + ")")
    })

    return {
        edges: edges,
        nodeIds: Array.from(categories.keys()),
        nodeLabels: Array.from(nodeLabels.entries()).map(([a, b]) => ({
            id: a, label: b
        }))
    }
}



export async function getCategoriesGraph(): Promise<TopicsGraph> {
    return await unstable_cache(async () => {
        return await getCategoriesGraphNoCache()
    },
        ["categoriesgraph"],
    {
        tags: ["topics"],
        revalidate: revalidateEverythingTime
    })()
}


export async function getTopicsInCategoryNoCache(cat: string): Promise<string[]> {
    const t1 = Date.now()
    let topics = await db.topic.findMany({
        select: {
            id: true,
            versions: {
                select: {
                    categories: true,
                    content: {
                        select: {
                            record: {
                                select: {
                                    createdAt: true
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    const categoryTopics: string[] = []
    for(let i = 0; i < topics.length; i++) {
        const curCats = currentCategories(topics[i])
        if(curCats.includes(cat)){
            categoryTopics.push(topics[i].id)
        }
    }
    const t2 = Date.now()
    return categoryTopics
}


export async function getTopicsInCategory(cat: string): Promise<string[]> {
    return await unstable_cache(async () => {
        return await getTopicsInCategoryNoCache(cat)
    }, ["categorytopics:"+cat],
    {
        tags: ["topics", "categorytopics:"+cat],
        revalidate: revalidateEverythingTime
    })()
}


function intersection(lists: string[][]): string[] {
    function cmp(l1: string[], l2: string[]){
        return l2.length - l1.length
    }

    lists = lists.sort(cmp)

    const sets = lists.map((l) => (new Set(l)))

    let intersection = []
    sets[0].forEach((x) => {
        for(let i = 1; i < sets.length; i++){
            if(!sets[i].has(x)) return
        }
        intersection.push(x)
    })

    return []
}


export async function getTopicsInCategories(cats: string[]){
    const topics: string[][] = []
    for(let i = 0; i < cats.length; i++){
        const topicsInCat = await getTopicsInCategory(cats[i])
        topics.push(topicsInCat)
    }
    return intersection(topics)
}


export async function getCategoryGraphNoCache(cat: string): Promise<TopicsGraph> {
    const topicIds = await getTopicsInCategory(cat)
    const topicIdsSet = new Set(topicIds)

    let topics = await db.topic.findMany({
        select: {
            id: true,
            referencedBy: {
                select: {
                    referencingContent: {
                        select: {
                            topicVersion: {
                                select: {
                                    topicId: true
                                }
                            }
                        }
                    }
                }
            }
        },
        where: {
            id: {
                in: topicIds
            }
        }
    })

    const edges = []
    for(let i = 0; i < topics.length; i++) {
        const yId = topics[i].id

        for(let j = 0; j < topics[i].referencedBy.length; j++){
            if(topics[i].referencedBy[j].referencingContent.topicVersion){
                const xId = topics[i].referencedBy[j].referencingContent.topicVersion.topicId
                if(!topicIdsSet.has(xId)) continue

                edges.push({
                    x: xId,
                    y: yId,
                })
            }
        }
    }
    return {
        nodeIds: topicIds.slice(0, 500),
        edges: edges.slice(0, 100)
    }
}


export const getCategoryGraph = unstable_cache(
    async (c: string) => {
        return await getCategoryGraphNoCache(c)
    },
    [],
    {
        tags: ["topics"],
        revalidate: revalidateEverythingTime
    }
)


function sortTopicsByPopularity(topics: [string, {score: number[], categories: string[]}][]){
    function cmp(a: [string, {score: number[]}], b: [string, {score: number[]}]){
        return listOrderDesc({score: a[1].score}, {score: b[1].score})
    }

    return topics.sort(cmp)
}


function sortTopicsByLastEdit(topics: [string, {score: number[], categories: string[]}][]){
    function cmp(a: [string, {score: number[]}], b: [string, {score: number[]}]){
        return listOrderDesc({score: [a[1].score[3]]}, {score: [b[1].score[3]]})
    }

    return topics.sort(cmp)
}


export async function getTopicsByCategories(sortedBy: string){
    const scoreMap = await getTopicsPopularityScoreMap()

    let scoreList = Array.from(scoreMap)

    if(sortedBy == "popular"){
        scoreList = sortTopicsByPopularity(scoreList)
    } else {
        scoreList = sortTopicsByLastEdit(scoreList)
    }

    const categories = new Map<string, string[]>()
    categories.set("Sin categoría", [])
    for(let i = 0; i < scoreList.length; i++){
        const topicCategories = scoreList[i][1].categories
        topicCategories.forEach((c) => {
            if(categories.has(c)){
                categories.get(c).push(scoreList[i][0])
            } else {
                categories.set(c, [scoreList[i][0]])
            }
        })
        if(topicCategories.length == 0){
            categories.get("Sin categoría").push(scoreList[i][0])
        }
    }

    function cmpCat(a: [string, string[]], b: [string, string[]]){
        if(a[0] == "Sin categoría") return 1
        if(b[0] == "Sin categoría") return -1
        let sa = 0
        let sb = 0
        a[1].forEach((v) => {
            sa += scoreMap.get(v)[0]-1
        })
        b[1].forEach((v) => {
            sb += scoreMap.get(v)[0]-1
        })
        return sa - sb
    }

    const cats = Array.from(categories).sort(cmpCat)

    const res: {c: string, topics: string[], size: number}[] = []
    for(let i = 0; i < cats.length; i++) {
        res.push({
            c: cats[i][0],
            topics: cats[i][1].slice(0, 5),
            size: cats[i][1].length
        })
    }
    return res
}


export async function getTopicsPopularityScoreNoCache(): Promise<{
    id: string, score: number[], categories: string[]}[]>{
    const t1 = Date.now()
    try {
        const contentInteractionsPromise = getContentInteractions()
        const topicsPromise = getTopicsNoCache()

        const [contentInteractions, topics] = await Promise.all([contentInteractionsPromise, topicsPromise])

        const contentInteractionsMap = new Map<string, Set<string>>()
        contentInteractions.map(({uri, interactions}) => {
            contentInteractionsMap.set(uri, new Set<string>(interactions))
        })

        const topicScores = new Map<string, {score: number[], categories: string[]}>()
        for(let i = 0; i < topics.length; i++){
            const score = getTopicPopularityScore(topics[i], contentInteractionsMap)
            topicScores.set(topics[i].id, {score, categories: currentCategories(topics[i])})
        }

        const t2 = Date.now()

        const res = Array.from(topicScores.entries()).map((t) => {
            return {id: t[0], score: t[1].score, categories: t[1].categories}
        })
        return res
    } catch (err) {
        console.error("Error", err)
        return null
    }
}


export async function getTopicsPopularityScoreMap(){
    const scores = await getTopicsPopularityScore()
    return new Map<string, {score: number[], categories: string[]}>(scores.map(({id, score, categories}) => ([
        id, {score, categories}
    ])))
}


export const getTopicsPopularityScore = unstable_cache(
    getTopicsPopularityScoreNoCache,
    undefined,
    {
        tags: ["asd"],
        revalidate: revalidateEverythingTime
    }
)
