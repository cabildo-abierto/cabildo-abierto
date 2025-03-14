"use server"
import {db} from "../../db";
import {revalidateTag, unstable_cache} from "next/cache";
import {TopicsGraph} from "../../app/lib/definitions";
import {logTimes, revalidateEverythingTime} from "../utils";
import {getCategories} from "./topics";


export async function updateCategoriesGraph(){
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

    await db.$transaction([
        db.categoryLink.deleteMany(),
        db.categoryLink.createMany({
            data: edges.map(e => ({
                idCategoryA: e.x,
                idCategoryB: e.y
            }))
        })
    ])
    revalidateTag("categoriesgraph")
}


export async function getCategoriesGraphNoCache(): Promise<TopicsGraph> {

    const links = await db.categoryLink.findMany({
        select: {
            idCategoryA: true,
            idCategoryB: true
        }
    })

    const categories = await getCategories()

    const nodeIds = categories.map(cat => cat.category)

    const nodeLabels = new Map<string, string>()
    categories.forEach(({category, size}) => {
        nodeLabels.set(category, category + " (" + size + ")")
    })

    return {
        nodeIds: Array.from(nodeIds),
        edges: links.map(l => ({
            x: l.idCategoryA,
            y: l.idCategoryB
        })),
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
            tags: ["categoriesgraph"],
            revalidate: revalidateEverythingTime
        }
    )()
}


export async function getCategoryGraphNoCache(cat: string): Promise<TopicsGraph> {
    const t1 = Date.now()
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
    const t2 = Date.now()

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
    const t3 = Date.now()

    logTimes("get category " + cat, [t1, t2, t3])
    return {
        nodeIds: topics.slice(0, 500).map(t => t.id),
        edges: edges.slice(0, 100)
    }
}


export const getCategoryGraph = async (c: string) => {
    return await unstable_cache(
        async () => {
            return await getCategoryGraphNoCache(c)
        },
        ["categorygraph:"+c],
        {
            tags: ["categorygraph:"+c, "categorygraph"],
            revalidate: revalidateEverythingTime
        }
    )()
}
