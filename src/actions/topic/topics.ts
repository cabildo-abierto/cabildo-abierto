"use server"

import {getSessionAgent} from "../auth";
import {
    TopicProps,
    TopicVersionProps,
    SmallTopicProps,
    TopicsGraph, TopicSortOrder, TopicHistoryProps,
} from "../../app/lib/definitions";
import {db} from "../../db";
import {logTimes, recordQuery, revalidateEverythingTime} from "../utils";
import {fetchBlob} from "../blob";
import {revalidateTag, unstable_cache} from "next/cache";
import {currentCategories, getCurrentContentVersion} from "../../components/topic/utils";
import {getRkeyFromUri} from "../../components/utils/uri";
import {oldestFirst} from "../../components/utils/arrays";
import {SmallTopicVersionProps} from "../../components/topic/topic-content-expanded-view";


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

    const select = {
        id: true,
        popularityScore: true,
        lastEdit: true,
        categories: {
            select: {
                categoryId: true,
            }
        }
    }

    if(sortedBy == "popular"){
        const topics = await db.topic.findMany({
            select,
            where: {
                ...where,
                popularityScore: {
                    not: null
                }
            },
            orderBy: {
                popularityScore: "desc"
            },
            take: limit
        })
        return {topics}
    } else {
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
        const topics = await db.topic.findMany({
            select,
            where: {
                ...where,
                lastEdit: {
                    not: null
                }
            },
            orderBy: {
                lastEdit: "desc"
            },
            take: limit
        })
        return {topics}
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
        if(!response || !response.ok) return null
        const responseBlob = await response.blob()
        if(!responseBlob) return null
        return await responseBlob.text()
    } catch (e) {
        console.error("Error getting text from blob", blob)
        console.error(e)
        return null
    }
}


export async function getTopicHistory(id: string): Promise<{topicHistory?: TopicHistoryProps, error?: string}> {
    try {
        const topicHistory = await unstable_cache(
            async () => {
                const versions = await db.record.findMany({
                    select: {
                        uri: true,
                        collection: true,
                        author: {
                            select: {
                                did: true,
                                handle: true,
                                displayName: true,
                                avatar: true
                            }
                        },
                        createdAt: true,
                        content: {
                            select: {
                                textBlob: true,
                                text: true,
                                topicVersion: {
                                    select: {
                                        charsAdded: true,
                                        charsDeleted: true,
                                        accCharsAdded: true,
                                        contribution: true,
                                        diff: true,
                                        message: true,
                                        categories: true,
                                        synonyms: true,
                                        title: true
                                    }
                                }
                            }
                        }
                    },
                    where: {
                        content: {
                            topicVersion: {
                                topicId: id
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "asc"
                    }
                })

                return {
                    id,
                    versions: versions.map(v => ({
                        ...v,
                        content: {
                            ...v.content,
                            hasText: v.content.textBlob != null || v.content.text != null
                        }
                    }))
                }
            },
            ["topicHistory:"+id],
            {
                tags: ["topicHistory", "topicHistory:"+id, "topic:"+id],
                revalidate: revalidateEverythingTime
            }
        )()
        return {topicHistory}
    } catch (e) {
        console.error("Error getting topic " + id)
        console.error(e)
        return {error: "No se pudo obtener el historial."}
    }
}


export async function getTopicById(id: string): Promise<{topic?: TopicProps, error?: string}>{
    const t1 = Date.now()
    const r = await unstable_cache(async () => {
        const topic = await db.topic.findUnique({
            select: {
                id: true,
                protection: true,
                synonyms: true,
                categories: {
                    select: {
                        categoryId: true,
                    }
                },
                popularityScore: true,
                lastEdit: true,
                currentVersion: {
                    select: {
                        uri: true,
                        content: {
                            select: {
                                text: true,
                                format: true,
                                textBlob: {
                                    select: {
                                        cid: true,
                                        authorId: true
                                    }
                                },
                                record: {
                                    select: {
                                        cid: true,
                                        author: {
                                            select: {
                                                did: true,
                                                handle: true,
                                                displayName: true,
                                                avatar: true
                                            }
                                        },
                                        createdAt: true
                                    }
                                }
                            }
                        }
                    }
                },
                currentVersionId: true
            },
            where: {
                id: id
            }
        })
        if (!topic) return {error: "No se encontró el tema " + id + "."}

        if(topic.currentVersion && !topic.currentVersion.content.text){
            if(topic.currentVersion.content.textBlob){
                topic.currentVersion.content.text = await getTextFromBlob(
                    topic.currentVersion.content.textBlob
                )
            }
        }

        return {topic}
    }, ["topic:"+id], {
        tags: ["topic:"+id],
        revalidate: revalidateEverythingTime
    })()
    const t2 = Date.now()

    logTimes("getTopicById", [t1, t2])
    return r
}


export async function getTopicVersionNoCache(uri: string){
    try {
        const topicVersion = await db.record.findUnique({
            select: {
                uri: true,
                cid: true,
                createdAt: true,
                content: {
                    select: {
                        text: true,
                        textBlob: true,
                        format: true
                    }
                }
            },
            where: {
                uri: uri
            }
        })

        if(!topicVersion.content.text){
            if(topicVersion.content.textBlob){
                topicVersion.content.text = await getTextFromBlob(
                    topicVersion.content.textBlob
                )
            }
        }

        return {
            topicVersion: {
                ...topicVersion,
                content: {
                    ...topicVersion.content,
                    record: {
                        uri: topicVersion.uri,
                        cid: topicVersion.cid,
                        createdAt: topicVersion.createdAt
                    }
                }
            }
        }
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


/*

function showAuthors(topic: TopicHistoryProps, topicVersion: TopicVersionProps) {
    const versionText = topicVersion.content.text

    function newAuthorNode(authors: string[], childNode){
        const authorNode: SerializedAuthorNode = {
            children: [childNode],
            type: "author",
            authors: authors,
            direction: 'ltr',
            version: childNode.version,
            format: 'left',
            indent: 0
        }
        return authorNode
    }

    const parsed = editorStateFromJSON(versionText)
    if(!parsed) {
        return versionText
    }
    let prevNodes = []
    let prevAuthors = []

    for(let i = 0; i < topic.versions.length; i++){
        const parsedVersion = editorStateFromJSON(decompress(topic.versions[i].content.text))
        if(!parsedVersion) continue
        const nodes = parsedVersion.root.children
        const {matches} = JSON.parse(topic.versions[i].content.topicVersion.diff)
        const versionAuthor = topic.versions[i].author.did
        let nodeAuthors: string[] = []
        for(let j = 0; j < nodes.length; j++){
            let authors = null
            for(let k = 0; k < matches.length; k++){
                if(matches[k] && matches[k].y == j){
                    const prevNodeAuthors = prevAuthors[matches[k].x]
                    if(getAllText(prevNodes[matches[k].x]) == getAllText(nodes[matches[k].y])){
                        authors = prevNodeAuthors
                    } else {
                        if(!prevNodeAuthors.includes(versionAuthor)){
                            authors = [...prevNodeAuthors, versionAuthor]
                        } else {
                            authors = prevNodeAuthors
                        }
                    }
                    break
                }
            }
            if(authors === null) authors = [versionAuthor]
            nodeAuthors.push(authors)
        }
        prevAuthors = [...nodeAuthors]
        prevNodes = [...nodes]
        if(topic.versions[i].uri == topicVersion.uri) break
    }
    const newChildren = []
    for(let i = 0; i < prevNodes.length; i++){
        newChildren.push(newAuthorNode(prevAuthors[i], prevNodes[i]))
    }
    parsed.root.children = newChildren
    return JSON.stringify(parsed)
}
 */


export async function getTopicVersionAuthors(uri: string): Promise<{topicVersionAuthors?: {text: string}, error?: string}> {
    return {
        topicVersionAuthors: {
            text: "Sin implementar"
        },
        error: undefined
    }
}


export async function getTopicVersionChanges(uri: string): Promise<{topicVersionChanges?: {text: string}, error?: string}> {
    return {
        topicVersionChanges: {
            text: "Sin implementar"
        },
        error: undefined
    }
}



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