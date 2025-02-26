"use server"

import {db} from "../db";
import {areArraysEqual, cabildoDid, cleanText, getDidFromUri} from "../components/utils";
import {getTextFromBlob} from "./topics";
import {PrismaPromise, ReferenceType } from "@prisma/client";
import {revalidateTag} from "next/cache";


function getCurrentSynonyms(topic: {id: string, versions: {synonyms?: string, content: {record: {createdAt: Date}}}[]}){
    let newest = null
    for(let i = 0; i < topic.versions.length; i++){
        const v = topic.versions[i]
        if(!v.synonyms) continue

        if(newest == null || v.content.record.createdAt.getTime() > topic.versions[newest].content.record.createdAt.getTime()){
            newest = i
        }
    }
    if(newest == null) return [topic.id]
    const synonyms: string[] = JSON.parse(topic.versions[newest].synonyms)
    return [topic.id, ...synonyms]
}


export async function updateTopicsSynonyms(){
    const topics: {
        id: string
        synonyms?: string[]
        versions: {
            synonyms?: string
            content: {
                record: {
                    createdAt: Date
                }
            }
        }[]
    }[] = await db.topic.findMany({
        select: {
            id: true,
            synonyms: true,
            versions: {
                select: {
                    synonyms: true,
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

    const updates = []
    for(let i = 0; i < topics.length; i++) {
        const curSynonyms = getCurrentSynonyms(topics[i])
        if(curSynonyms.length == 1 && !topics[i].synonyms){
            continue
        }
        if(!areArraysEqual(curSynonyms, topics[i].synonyms)){
            console.log("Updating synonyms for", topics[i].id, curSynonyms)
            updates.push(db.topic.update({
                data: {
                    synonyms: curSynonyms,
                    lastSynonymsChange: new Date()
                },
                where: {
                    id: topics[i].id
                }
            }))
        }
    }
    const batch_size = 100
    for(let i = 0; i < updates.length; i += batch_size){
        console.log("Applying updates", i, "of", updates.length)
        await db.$transaction(updates.slice(i, i+batch_size))
    }
    console.log("done")
}


async function getTopicsWithSynonyms(){
    const topics: {
        id: string
        synonyms?: string[]
        lastSynonymsChange?: Date
        versions: {
            synonyms?: string
            content: {
                record: {
                    createdAt: Date
                }
            }
        }[]
    }[] = await db.topic.findMany({
        select: {
            id: true,
            synonyms: true,
            lastSynonymsChange: true,
            versions: {
                select: {
                    synonyms: true,
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

    return topics.filter((t) => (t.versions.length > 0))
}


type ContentTextOrBlob = {
    text?: string
    format?: string
    uri: string
    textBlob?: {
        cid: string
        authorId: string
    }
    lastReferencesUpdate?: Date
}


function isSynonymInText(key: string, text: string){
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\/[\\]/g, '\\$&');

    const regex = new RegExp(`\\b${escapedKey}\\b`, 'i');

    if(regex.test(text)){
        return true
    }
}


async function updateReferencesForContent(
    content: ContentTextOrBlob,
    synonymsToTopicsMap: Map<string, Set<{id: string, lastSynonymsChange?: Date}>>) : Promise<PrismaPromise<any>[]>{
    let text: string
    if(content.text){
        text = content.text
    } else if(content.textBlob){
        try {
            text = await getTextFromBlob(content.textBlob)
        } catch (e) {
            console.log("Couldn't fetch blob for content", content.uri)
            console.log(e)
            return []
        }
    } else {
        return []
    }

    const referencedTopics = new Set<{id: string, lastSynonymsChange?: Date}>()
    synonymsToTopicsMap.forEach((topics, syonynm) => {
        if(isSynonymInText(syonynm, text)){
            topics.forEach((t) => {
                referencedTopics.add(t)
            })
        }
    })

    let updates = []
    referencedTopics.forEach((t) => {
        const record = {
            type: ReferenceType.Weak,
            referencedTopicId: t.id,
            referencingContentId: content.uri
        }

        // si la última actualización de sinónimos del topic es previa a la última actualización de referencias del content, no actualizo
        if(t.lastSynonymsChange && t.lastSynonymsChange < content.lastReferencesUpdate){
            return
        }

        updates.push(db.reference.upsert({
            create: record,
            update: record,
            where: {
                referencingContentId_referencedTopicId: {
                    referencingContentId: content.uri,
                    referencedTopicId: t.id,
                },
            }
        }))
        updates.push(db.content.update({
            data: {
                lastReferencesUpdate: new Date()
            },
            where: {
                uri: content.uri
            }
        }))
    })

    return updates
}


function getTopicCreationDate(t: {versions: {content: {record: {createdAt: Date}}}[]}){
    let minDate = t.versions[0].content.record.createdAt
    t.versions.forEach((t) => {
        if(minDate > t.content.record.createdAt){
            minDate = t.content.record.createdAt
        }
    })
    return minDate
}


function getLastSynonymsUpdate(topics: {versions: {synonyms?: string, content: {record: {createdAt: Date}}}[]}[]){
    let last: Date = undefined
    topics.forEach((t) => {
        const creationDate = getTopicCreationDate(t)
        if(!last || last < creationDate) last = creationDate
        t.versions.forEach(version => {
            if(version.synonyms && last < version.content.record.createdAt){
                last = version.content.record.createdAt
            }
        })
    })
    return last
}


export async function updateReferences(){
    console.log("Updating references")

    const topics = await getTopicsWithSynonyms()

    const lastTopicUpdate = getLastSynonymsUpdate(topics)

    console.log("got topics", topics.length)

    const synonymsToTopicsMap = new Map<string, Set<{id: string, lastSynonymsChange?: Date}>>()

    topics.forEach((t) => {
        const synonyms = getCurrentSynonyms(t).map((s) => cleanText(s))

        synonyms.forEach((s) => {
            if(synonymsToTopicsMap.has(s)){
                const cur = synonymsToTopicsMap.get(s)
                cur.add({id: t.id, lastSynonymsChange: t.lastSynonymsChange})
                synonymsToTopicsMap.set(s, cur)
            } else {
                synonymsToTopicsMap.set(s, new Set([{id: t.id, lastSynonymsChange: t.lastSynonymsChange}]))
            }
        })
    })

    console.log("Getting contents")

    let contents: ContentTextOrBlob[] = await db.content.findMany({
        select: {
            uri: true,
            text: true,
            textBlob: true,
            format: true,
            lastReferencesUpdate: true
        }
    })

    contents = contents.filter((c) => (c.lastReferencesUpdate <= lastTopicUpdate))
    // contents = contents.filter((c) => (getDidFromUri(c.uri) != cabildoDid))

    console.log("Updating", contents.length, "contents")
    let updates: PrismaPromise<any>[] = []
    for(let i = 0; i < contents.length; i++){
        updates = [...updates, ...(await updateReferencesForContent(contents[i], synonymsToTopicsMap))]
        if(updates.length > 100){
            console.log("Applying", updates.length, "updates for contents up to", i)
            await db.$transaction(updates)
            revalidateTag("topics")
            updates = []
        }
    }
    console.log("Applying", updates.length, "updates for last contents")
    await db.$transaction(updates)
    console.log("done")
}