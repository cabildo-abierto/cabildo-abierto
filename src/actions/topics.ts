"use server"

import {getSessionAgent} from "./auth";
import {TopicProps, TopicVersionProps, SmallTopicProps, MapTopicProps, TopicsGraph} from "../app/lib/definitions";
import {db} from "../db";
import {
    cleanText,
    currentCategories,
    currentVersionContent,
    getDidFromUri,
    getRkeyFromUri,
    listOrderDesc,
    supportDid
} from "../components/utils";
import {Prisma} from ".prisma/client";
import SortOrder = Prisma.SortOrder;
import {getObjectSizeInBytes, recordQuery, revalidateEverythingTime} from "./utils";
import {fetchBlob} from "./data";
import {revalidateTag, unstable_cache} from "next/cache";
import {getCurrentContentVersion} from "../components/topic/utils";


export async function createTopic(id: string){
    return await createTopicVersion({id, claimsAuthorship: true})
}


export async function createTopicVersion({
    id, text, format="markdown", title, claimsAuthorship, message, createOnATProto=true, categories, synonyms}: {
    id: string,
    text?: FormData,
    format?: string,
    title?: string
    claimsAuthorship: boolean
    message?: string
    createOnATProto?: boolean
    categories?: string[]
    synonyms?: string[]
}){

    const {agent, did} = await getSessionAgent()
    if(!did) return {error: "Iniciá sesión para crear un tema."}

    let blob = null
    if(text){
        const data = Object.fromEntries(text);
        let f = data.data as File
        const headers: Record<string, string> = {
            "Content-Length": f.size.toString()
        }
        const res = await agent.uploadBlob(f, {headers})
        blob = res.data.blob
    }

    const record = {
        "$type": "ar.com.cabildoabierto.topic",
        text: blob ? {
            ref: blob.ref,
            mimeType: blob.mimeType,
            size: blob.size,
            $type: "blob"
        } : null,
        title,
        format,
        message,
        categories: categories ? JSON.stringify(categories) : undefined,
        synonyms: synonyms ? JSON.stringify(synonyms) : undefined,
        id,
        createdAt: new Date().toISOString()
    }
    try {
        await agent.com.atproto.repo.createRecord({
            repo: did,
            collection: 'ar.com.cabildoabierto.topic',
            record: record,
        })
        revalidateTag("topic:"+id)
        revalidateTag("topics")
    } catch (e) {
        console.log("error", e)
        return {error: "Ocurrió un error al publicar en ATProto."}
    }

    return {}
}


export async function updateCategoriesInTopic({topicId, categories}: {topicId: string, categories: string[]}) {
    const res = await createTopicVersion({
        id: topicId,
        categories,
        claimsAuthorship: false,
    })
    revalidateTag("categories")
    return res
}


export async function updateSynonymsInTopic({topicId, synonyms}: {topicId: string, synonyms: string[]}) {

    return await createTopicVersion({
        id: topicId,
        synonyms,
        claimsAuthorship: false,
    })
}




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


function countUserInteractions(entity: TopicUserInteractionsProps, since?: Date){
    function recentEnough(date: Date){
        return !since || date > since
    }

    function addMany(g: {authorId: string, createdAt: Date}[]){
        for(let i = 0; i < g.length; i++) {
            if(recentEnough(g[i].createdAt)){
                s.add(g[i].authorId)
            }
        }
    }

    let s = new Set()

    entity.referencedBy.forEach(({referencingContent}) => {
        if(recentEnough(referencingContent.record.createdAt)){
            s.add(referencingContent.record.authorId)
        }
    })

    for(let i = 0; i < entity.referencedBy.length; i++){
        const referencingContent = entity.referencedBy[i].referencingContent
        addMany(referencingContent.record.rootOf.map((post) => (post.content.record)))
        for(let j = 0; j < referencingContent.record.rootOf.length; j++){
            addMany(referencingContent.record.rootOf[j].content.record.reactions.map(({record}) => (record)))
        }
        addMany(referencingContent.record.reactions.map(({record}) => (record)))
    }

    //if(entity.name == entityId) console.log("Referencias", s)
    //if(entity.name == entityId) console.log("Reacciones", s)
    for(let i = 0; i < entity.versions.length; i++){
        // autores de las versiones
        if(recentEnough(entity.versions[i].content.record.createdAt)){
            s.add(entity.versions[i].content.record.authorId)
        }

        // comentarios y subcomentarios de las versiones
        addMany(entity.versions[i].content.record.rootOf.map((post) => (post.content.record)))
    }

    //if(entity.name == entityId) console.log("weak refs", s)
    //if(entity.name == entityId) console.log("Total", entity.name, s.size, s)

    s.delete(supportDid)

    const currentContentVersion = getCurrentContentVersion(entity)

    const currentContent = entity.versions[currentContentVersion]
    const lastVersion = entity.versions[entity.versions.length - 1]

    return [
        s.size,
        currentContent.content.numWords > 0 ? 1 : 0,
        currentContent ? new Date(lastVersion.content.record.createdAt).getTime() : 0
    ]

}


export async function getTrendingTopics(
    sinceKind: string = "alltime",
    categories: string[],
    sortedBy: string,
    limit: number = 10
): Promise<{error?: string, topics?: SmallTopicProps[]}> {
    return await unstable_cache(async () => {
        return await getTrendingTopicsNoCache(sinceKind, categories, sortedBy, limit)
    },
        ["tt:"+sinceKind+":"+categories.join(":")+":"+limit+":"+sortedBy],
        {
            tags: ["tt", "tt:"+sinceKind, "topics"],
            revalidate: revalidateEverythingTime
        }
    )()
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
        cInteractions.forEach((uri) => {
            const did = getDidFromUri(uri)
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


export async function getTrendingTopicsNoCache(
    sincekind: string, categories: string[], sortedBy: string, limit: number): Promise<{
    error?: string
    topics?: SmallTopicProps[]
}> {
    const t1 = Date.now()

    //console.log("getting TT", sortedBy, limit, categories)
    try {

        const scoreMap = await getTopicsPopularityScore()
        let scoreList = Array.from(scoreMap)
        const t2 = Date.now()
        //console.log("Getting popularity score", t2-t1)

        scoreList = scoreList.filter((t) => {
            if(categories.length == 0) return true
            return !categories.some((c) => {
                return !t[1].categories.includes(c)
            });
        })

        function cmpRecent(a: [string, {score: number[]}], b: [string, {score: number[]}]){
            return listOrderDesc({score: [a[1].score[3]]}, {score: [b[1].score[3]]})
        }

        let firstK: string[]
        if(sortedBy == "popular"){
            firstK = sortTopicsByPopularity(scoreList).slice(0, limit).map(([id, score]) => (id))
        } else {
            firstK = sortTopicsByLastEdit(scoreList).sort(cmpRecent).slice(0, limit).map(([id, score]) => (id))
        }

        const topics = await db.topic.findMany({
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
        //console.log("Topics query time", t3-t2)

        //console.log("TT Time", t3 - t1)
        const res = {topics: topics.map((t) => ({...t, score: scoreMap.get(t.id).score}))}
        return res
    } catch (err) {
        console.log("Error", err)
        return {error: "Error al buscar los temas."}
    }
}


const topicQuery = {
    id: true,
    protection: true,
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
    },
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
                            },
                            replies: {
                                select: {
                                    content: {
                                        select: {
                                            text: true,
                                            record: {
                                                select: recordQuery,
                                            }
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
    return unstable_cache(async () => {
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
                    uri: true
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
    return await unstable_cache(async () => {
        try {
            const response = await fetchBlob(blob)
            if(!response.ok) return null
            const responseBlob = await response.blob()
            if(!responseBlob) return null
            return await responseBlob.text()
        } catch (e) {
            console.log("Error getting text from blob", blob)
            console.log(e)
            return null
        }
    }, ["blob:"+blob.authorId+":"+blob.cid], {
        tags: ["blob:"+blob.authorId+":"+blob.cid, "blobs"],
        revalidate: revalidateEverythingTime
    })()
}


export async function getTopicByIdNoCache(id: string): Promise<{topic?: TopicProps, error?: string}>{
    try {
        const topic: TopicProps = await db.topic.findUnique({
            select: topicQuery,
            where: {
                id: id
            }
        })

        for(let i = 0; i < topic.versions.length; i++){
            if(topic.versions[i].content.textBlob != undefined){
                topic.versions[i].content.text = await getTextFromBlob(topic.versions[i].content.textBlob)
            }
        }
        return {topic: topic}
    } catch (e) {
        console.log("Error on getTopicById with id", id)
        console.log(e)
        return {error: "No se encontró el tema."}
    }
}


export async function getTopicById(id: string): Promise<{topic?: TopicProps, error?: string}>{
    return await unstable_cache(async () => {
        return await getTopicByIdNoCache(id)
    }, ["topic:"+id], {
        tags: ["topic:"+id],
        revalidate: revalidateEverythingTime
    })()
}


export async function getTopicVersion(uri: string){
    try {
        const topic: TopicVersionProps = await db.topicVersion.findUnique({
            select: {
                uri: true,
                topicId: true,
                message: true,
                title: true,
                diff: true,
                charsAdded: true,
                accCharsAdded: true,
                contribution: true,
                authorship: true,
                content: {
                    select: {
                        text: true,
                        format: true,
                        record: {
                            select: recordQuery,
                        },
                    },
                }
            },
            where: {
                uri: uri
            }
        })

        return {topic: topic}
    } catch {
        return {error: "No se encontró el tema."}
    }
}


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
        console.log("deleted", data.records[i].uri)
    }
}


export async function getCategoriesGraphNoCache(): Promise<TopicsGraph> {
    let topics: MapTopicProps[] = await db.topic.findMany({
        select: {
            id: true,
            versions: {
                select: {
                    categories: true
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


export async function getCategoryGraphNoCache(cat: string): Promise<TopicsGraph> {

    let topics: MapTopicProps[] = await db.topic.findMany({
        select: {
            id: true,
            versions: {
                select: {
                    categories: true
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

    const topicsInCategory = new Set<string>()
    for(let i = 0; i < topics.length; i++) {
        const c = currentCategories(topics[i])
        topicToCategoriesMap.set(topics[i].id, c)
        if(c.includes(cat)){
            topicsInCategory.add(topics[i].id)
        }
    }

    const edges = []
    for(let i = 0; i < topics.length; i++) {
        const yId = topics[i].id
        const catY = topicToCategoriesMap.get(yId)
        if(!catY.includes(cat)) continue

        for(let j = 0; j < topics[i].referencedBy.length; j++){
            if(topics[i].referencedBy[j].referencingContent.topicVersion){
                const xId = topics[i].referencedBy[j].referencingContent.topicVersion.topicId
                const catX = topicToCategoriesMap.get(xId)
                if(!catX.includes(cat)) continue

                edges.push({
                    x: xId,
                    y: yId,
                })
            }
        }
    }
    return {
        nodeIds: Array.from(topicsInCategory).slice(0, 500),
        edges: edges.slice(0, 100)
    }
}


export async function getCategoryGraph(c: string): Promise<TopicsGraph> {
    return await unstable_cache(async () => {
            return await getCategoryGraphNoCache(c)
        },
        ["categorygraph:"+c],
        {
            tags: ["topics"],
            revalidate: revalidateEverythingTime
    })()
}


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


export async function getTopicsByCategoriesNoCache(sortedBy: string): Promise<{c: string, topics: string[], size: number}[]>{
    const scoreMap = await getTopicsPopularityScore()
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


export async function getTopicsByCategories(sortedBy: string){
    return await unstable_cache(async () => {
            return await getTopicsByCategoriesNoCache(sortedBy)
        },
        ["topicsbycategories:"+sortedBy],
        {
            tags: ["topics"],
            revalidate: revalidateEverythingTime
        }
    )()
}


export async function getTopicsPopularityScoreNoCache(): Promise<{id: string, score: number[], categories: string[]}[]>{

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

        return Array.from(topicScores.entries()).map((t) => {
            return {id: t[0], score: t[1].score, categories: t[1].categories}
        })
    } catch (err) {
        console.log("Error", err)
        return null
    }
}


export async function getTopicsPopularityScore(): Promise<Map<string, {score: number[], categories: string[]}>>{
    const scores = await unstable_cache(async () => {
            return await getTopicsPopularityScoreNoCache()
        },
        ["popularityscores"],
        {
            tags: ["topics", "popularityscores"],
            revalidate: revalidateEverythingTime
        }
    )()
    return new Map<string, {score: number[], categories: string[]}>(scores.map(({id, score, categories}) => ([
        id, {score, categories}
    ])))
}
