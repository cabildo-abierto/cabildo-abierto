"use server"

import {getSessionAgent} from "./auth";
import {TopicProps, TopicVersionProps, SmallTopicProps} from "../app/lib/definitions";
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
import {recordQuery, revalidateEverythingTime} from "./utils";
import {fetchBlob} from "./data";
import {unstable_cache} from "next/cache";
import {getCurrentContentVersion} from "../components/topic/utils";


export async function createTopic(id: string){
    return await createTopicVersion({id, claimsAuthorship: true})
}


export async function createTopicVersion({
    id, text, format="markdown", title, claimsAuthorship, message, createOnATProto=true, categories}: {
    id: string,
    text?: FormData,
    format?: string,
    title?: string
    claimsAuthorship: boolean
    message?: string
    createOnATProto?: boolean
    categories?: string[]
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
        categories: JSON.stringify(categories),
        id,
        createdAt: new Date().toISOString()
    }
    try {
        await agent.com.atproto.repo.createRecord({
            repo: did,
            collection: 'ar.com.cabildoabierto.topic',
            record: record,
        })
    } catch (e) {
        console.log("error", e)
        return {error: "Ocurrió un error al publicar en ATProto."}
    }

    return {}
}


export async function updateCategoriesInTopic({topicId, categories}: {topicId: string, categories: string[]}) {

    await createTopicVersion({
        id: topicId,
        categories,
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


export async function getTrendingTopics(sinceKind: string = "alltime", categories: string[], limit: number = 10, sortedby: string = "popular"): Promise<{error?: string, topics?: SmallTopicProps[]}> {

    return await unstable_cache(async () => {
        return await getTrendingTopicsNoCache(sinceKind, categories, sortedby, limit)
    },
        ["tt:"+sinceKind+":"+categories.join(":")+":"+limit+":"+sortedby],
        {
            tags: ["tt", "tt:"+sinceKind],
            revalidate: 5//revalidateEverythingTime
        }
    )()
}


function newestVersion(a: SmallTopicProps, b: SmallTopicProps){
    return b.versions[b.versions.length-1].content.record.createdAt.getTime() - a.versions[a.versions.length-1].content.record.createdAt.getTime()
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


export async function getContentInteractions(): Promise<{uri: string, interactions: string[]}[]> {
    return await unstable_cache(async () => {
        return await getContentInteractionsNoCache()
    }, ["interactions"],
        {
            tags: ["interactions"],
            revalidate: revalidateEverythingTime
        }
    )()
}


export async function getContentInteractionsNoCache() : Promise<{uri: string, interactions: string[]}[]> {
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


export async function getTopics() {
    return await unstable_cache(async () => {
        return await getTopicsNoCache()
    },
        ["topics"],
        {
            tags: ["topics"],
            revalidate: revalidateEverythingTime
        }
    )()
}


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
        cInteractions.forEach((uri) => {
            const did = getDidFromUri(uri)
            s.add(did)
        })
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
    const lastVersion = topic.versions[topic.versions.length-1]
    return [
        interactions,
        currentContent.content.numWords > 0 ? 1 : 0,
        currentContent ? new Date(lastVersion.content.record.createdAt).getTime() : 0
    ]
}



export async function getTrendingTopicsNoCache(sincekind: string, categories: string[], sortedby: string, limit: number): Promise<{error?: string, topics?: SmallTopicProps[]}> {
    // sinceKind is always alltime
    const since = undefined

    try {

        const t1 = new Date().getTime()

        const contentInteractionsPromise = getContentInteractions()

        const topicsPromise = getTopics()

        const [contentInteractions, topics] = await Promise.all([contentInteractionsPromise, topicsPromise])

        const contentInteractionsMap = new Map<string, Set<string>>()
        contentInteractions.map(({uri, interactions}) => {
            contentInteractionsMap.set(uri, new Set<string>(interactions))
        })

        const t2 = new Date().getTime()

        const topicScores = new Map<string, number[]>()
        for(let i = 0; i < topics.length; i++){
            const score = getTopicPopularityScore(topics[i], contentInteractionsMap)
            topicScores.set(topics[i].id, score)
        }

        let topicsWithScore: SmallTopicProps[] = topics.map((topic) => {
            return {
                ...topic,
                score: topicScores.get(topic.id)
            }
        })

        if(sortedby == "popular") {
            topicsWithScore.sort(listOrderDesc)
        } else {
            topicsWithScore.sort(newestVersion)
        }

        let filteredTopics = topicsWithScore.filter((t) => {
            if(categories.length == 0) return true
            const current = currentCategories(t)

            return !categories.some((c) => (!current.includes(c)))
        })

        filteredTopics = limit ? filteredTopics.slice(0, limit) : filteredTopics

        const t3 = new Date().getTime()
        return {topics: filteredTopics}

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
            topicId: true,
            title: true,
            message: true,
            diff: true,
            charsAdded: true,
            accCharsAdded: true,
            contribution: true,
            authorship: true,
            categories: true
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


export async function getCategoriesNoCache() {
    const topics = await db.topic.findMany({
        select: {
            versions: {
                select: {
                    categories: true
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
    return Array.from(categories)
}


export async function getTextFromBlob(blob: {cid: string, authorId: string}){
    return await unstable_cache(async () => {
        const response = await fetchBlob(blob)
        const responseBlob = await response.blob()
        return await responseBlob.text()
    }, ["blob:"+blob.authorId+":"+blob.cid], {
        tags: ["blob:"+blob.authorId+":"+blob.cid, "blobs"],
        revalidate: revalidateEverythingTime
    })()
}


export async function getTopicById(id: string): Promise<{topic?: TopicProps, error?: string}>{
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


export async function getTopicsForSearch(){
    return await unstable_cache(async () => {
        const topics: SmallTopicProps[] = await db.topic.findMany({
            select: {
                id: true,
                versions: {
                    select: {
                        uri: true,
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
            }
        })
        return topics.filter((t) => (t.versions.length > 0))
    }, ["topicsForSearch"], {
        tags: ["topics"]
    })()
}


export async function searchTopics(q: string){
    q = cleanText(q)

    const topics = await getTopicsForSearch()

    return topics.filter((t) => {
        return cleanText(t.id).includes(q)
    })
}