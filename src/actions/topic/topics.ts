"use server"

import {getSessionAgent} from "../auth";
import {
    TopicProps,
    TopicVersionProps,
    SmallTopicProps,
    TopicsGraph, TopicSortOrder,
} from "../../app/lib/definitions";
import {db} from "../../db";
import {
    currentCategories,
    getRkeyFromUri,
    newestFirst, oldestFirst,
} from "../../components/utils/utils";
import {logTimes, recordQuery, revalidateEverythingTime} from "../utils";
import {fetchBlob} from "../data";
import {unstable_cache} from "next/cache";
import {getCurrentContentVersion} from "../../components/topic/utils";


export async function getTrendingTopics(categories: string[],
                                        sortedBy: "popular" | "recent",
                                        limit: number){
    return await unstable_cache(
        async () => {
            return await getTrendingTopicsNoCache(categories, sortedBy, limit)
        },
        ["tt:"+categories.join("-")+":"+sortedBy+":"+limit],
        {
            tags: ["topics"],
            revalidate: revalidateEverythingTime,
        }
    )()
}


export async function getTrendingTopicsNoCache(
    categories: string[],
    sortedBy: "popular" | "recent",
    limit: number): Promise<{
    error?: string
    topics?: SmallTopicProps[]
}> {
    if(sortedBy == "popular"){
        const where = {
            AND: categories.map((c) => {
                if(c == "Sin categoría"){
                    return {categories: {none: {}}}
                } else {
                    return {categories: {some: {categoryId: c}}}
                }
            }),
            versions: {
                some: {}
            }
        }
        //const t1 = Date.now()
        const topics = await db.topic.findMany({
            select: {
                id: true,
                popularityScore: true,
                categories: {
                    select: {
                        categoryId: true,
                    }
                }
            },
            where: where,
            orderBy: {
                popularityScore: "desc"
            },
            take: limit
        })
        //const t2 = Date.now()
        //logTimes("TT " + categories, [t1, t2])
        return {topics}
    } else {
        throw Error("Not implemented")
    }
}


const topicQuery = {
    id: true,
    protection: true,
    synonyms: true,
    categories: {
        select: {
            categoryId: true,
        }
    },
    popularityScore: true,
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
                    categories: true,
                    synonyms: true,
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

export async function getCategoriesNoCache() {
    const categoriesP = db.topicCategory.findMany({
        select: {
            id: true,
            _count: {
                select: {
                    topics: true
                }
            }
        }
    })

    const noCategoryCountP = db.topic.count({
        where: {
            categories: {
                none: {}
            }
        }
    })

    let [categories, noCategoryCount] = await Promise.all([categoriesP, noCategoryCountP])

    categories = categories.filter(c => (c._count.topics > 0))

    const res = categories.map(({id, _count}) => ({category: id, size: _count.topics}))
    res.push({category: "Sin categoría", size: noCategoryCount})
    return res
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

    if(topicWithVersions.versions.length > 0){
        topicWithVersions.versions = topicWithVersions.versions.sort(oldestFirst)

        const version = getCurrentContentVersion(topicWithVersions)
        if(topicWithVersions.versions[version].content.textBlob != undefined){
            topicWithVersions.versions[version].content.text = await getTextFromBlob(topicWithVersions.versions[version].content.textBlob)
        }
    }
    const t4 = Date.now()

    logTimes("getting topic " + id, [t1, t2, t3, t4])

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
            categories: {
                select: {
                    categoryId: true
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
        const cats = topics[i].categories.map(({categoryId}) => (categoryId))
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
            categories: {
                some: {categoryId: cat}
            }
        }
    })

    const topicIdsSet = new Set(topics.map(t => t.id))

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
        nodeIds: topics.slice(0, 500).map(t => t.id),
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


export async function getTopicsByCategoriesNoCache(sortedBy: TopicSortOrder){

    const t1 = Date.now()
    const categoriesWithSize = await getCategories()
    const t2 = Date.now()

    const sizeMap = new Map<string, number>(categoriesWithSize.map(({category, size}) => ([category, size])))

    const categories = categoriesWithSize.map(({category}) => (category))

    const categoriesMap = new Map<string, SmallTopicProps[]>()

    const t3 = Date.now()
    const promises: Promise<{error?: string, topics?: SmallTopicProps[]}>[] = []
    for(let i = 0; i < categories.length; i++){
        const c = categories[i]
        promises.push(getTrendingTopics([c], sortedBy, 5))
    }
    const tt = await Promise.all(promises)
    const t4 = Date.now()

    for(let i = 0; i < categories.length; i++) {
        categoriesMap.set(categories[i], tt[i].topics)
    }

    const cats = Array.from(categoriesMap)

    const res: {c: string, topics: string[], size: number}[] = []
    for(let i = 0; i < cats.length; i++) {
        res.push({
            c: cats[i][0],
            topics: cats[i][1].slice(0, 5).map(t => t.id),
            size: sizeMap.get(cats[i][0])
        })
    }
    const t5 = Date.now()
    logTimes("topics by categories time", [t1, t2, t3, t4, t5])

    return res
}


export async function getTopicsByCategories(sortedBy: TopicSortOrder){
    return await unstable_cache(
        async () => {
            return await getTopicsByCategoriesNoCache(sortedBy)
        },
        ["bycategories:"+sortedBy],
        {
            tags: ["topics"],
            revalidate: revalidateEverythingTime
        }
    )()
}