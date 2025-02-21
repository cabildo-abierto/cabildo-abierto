"use server"

import {db} from "../db";
import {cleanText} from "../components/utils";
import {getTextFromBlob} from "./topics";
import { ReferenceType } from "@prisma/client";


function getCurrentSynonyms(topic: {id: string, versions: {synonyms: string, content: {record: {createdAt: Date}}}[]}){
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


async function getTopicsWithSynonyms(){
    const topics = await db.topic.findMany({
        select: {
            id: true,
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
}


function isSynonymInText(key: string, text: string){
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\/[\\]/g, '\\$&');

    const regex = new RegExp(`\\b${escapedKey}\\b`, 'i');

    if(regex.test(text)){
        return true
    }
}


export async function updateReferencesForContent(content: ContentTextOrBlob, synonymsToTopicsMap: Map<string, Set<string>>){
    let text: string
    if(content.text){
        text = content.text
    } else if(content.textBlob){
        text = await getTextFromBlob(content.textBlob)
    } else {
        console.log("No text")
        console.log(content)
        return
    }

    const referencedTopics = new Set<string>()
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
            referencedTopicId: t,
            referencingContentId: content.uri
        }
        updates.push(db.reference.upsert({
            create: record,
            update: record,
            where: {
                referencingContentId_referencedTopicId: {
                    referencingContentId: content.uri,
                    referencedTopicId: t,
                },
            }
        }))
        console.log("adding reference between", t, "and", content.uri)
    })

    await db.$transaction(updates)
}


export async function updateReferences(){
    console.log("Updating references")

    const topics = await getTopicsWithSynonyms()

    console.log("got topics", topics.length)

    const synonymsToTopicsMap = new Map<string, Set<string>>() // synonymsToTopicsMap

    topics.forEach((t) => {
        const synonyms = getCurrentSynonyms(t).map((s) => cleanText(s))

        synonyms.forEach((s) => {
            if(synonymsToTopicsMap.has(s)){
                const cur = synonymsToTopicsMap.get(s)
                cur.add(t.id)
                synonymsToTopicsMap.set(s, cur)
            } else {
                synonymsToTopicsMap.set(s, new Set([t.id]))
            }
        })
    })

    console.log("Getting contents")

    const contents: ContentTextOrBlob[] = await db.content.findMany({
        select: {
            uri: true,
            text: true,
            textBlob: true,
            format: true
        }
    })

    console.log("Updating", contents.length, "contents")
    for(let i = 0; i < contents.length; i++){
        console.log("Updating content", i, contents[i].uri)
        const t1 = new Date().getTime()
        await updateReferencesForContent(contents[i], synonymsToTopicsMap)
        console.log("Took", new Date().getTime()-t1)
    }
}