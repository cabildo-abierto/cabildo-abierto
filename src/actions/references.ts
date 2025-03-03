"use server"

import {db} from "../db";
import {areArraysEqual, cabildoDid, cleanText, getDidFromUri, tomasDid} from "../components/utils/utils";
import {getTextFromBlob} from "./topics";


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
    return [cleanText(topic.id), ...synonyms]
}





export async function getPendingSynonymsUpdates(){
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
            console.log("Prev", topics[i].synonyms)
            console.log("Cur", curSynonyms)
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

    return updates
}


export async function getPendingSynonymsUpdatesCount(){
    return (await getPendingSynonymsUpdates()).length
}



export async function updateTopicsSynonyms(){
    const updates = await getPendingSynonymsUpdates()
    const batch_size = 100
    for(let i = 0; i < updates.length; i += batch_size){
        console.log("Applying updates", i, "of", updates.length)
        const t1 = new Date().getTime()
        await db.$transaction(updates.slice(i, i+batch_size))
        const t2 = new Date().getTime()
        console.log("Done after", (t2-t1) / 1000, 1000 * updates.length / (t2-t1), "updates per second")
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
    const escapedKey = cleanText(key).replace(/[.*+?^${}()|[\]\\/[\\]/g, '\\$&');

    const regex = new RegExp(`\\b${escapedKey}\\b`, 'i');

    if(regex.test(cleanText(text))){
        return true
    }
}


async function updateReferencesForContent(
    content: ContentTextOrBlob,
    synonymsToTopicsMap: Map<string, Set<{id: string, lastSynonymsChange?: Date}>>){
    let text: string
    if(content.text){
        text = content.text
    } else if(content.textBlob){
        try {
            const t1 = Date.now()
            text = await getTextFromBlob(content.textBlob)
            const t2 = Date.now()
            console.log("fetching blob took", t2-t1, "and found blob", text != null)
            if(text == null) return []
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

    const referenceRecords = []
    for (const t of referencedTopics) {
        if (t.lastSynonymsChange && content.lastReferencesUpdate && t.lastSynonymsChange < content.lastReferencesUpdate) {
            console.log("skipping content", t.lastSynonymsChange, content.lastReferencesUpdate)
            continue;
        }
        referenceRecords.push({uri: content.uri, topicId: t.id, type: "Weak"});
    }

    return referenceRecords
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
    const updateTime = new Date()

    const topics = await getTopicsWithSynonyms()

    const lastTopicUpdate = getLastSynonymsUpdate(topics)

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

    let contents: ContentTextOrBlob[] = await db.content.findMany({
        select: {
            uri: true,
            text: true,
            textBlob: true,
            format: true,
            lastReferencesUpdate: true
        }
    })

    contents = contents.filter((c) => (!c.lastReferencesUpdate || c.lastReferencesUpdate <= lastTopicUpdate))

    let contentsWithNoRefs: string[] = []
    console.log("Contents possibly pending", contents.length)
    let allReferenceRecords: {uri: string, topicId: string, type: string}[] = []
    let t1 = new Date().getTime()
    for (let i = 0; i < contents.length; i++) {
        const content = contents[i]
        const records = await updateReferencesForContent(content, synonymsToTopicsMap)

        if (records.length > 0) {
            allReferenceRecords = [...allReferenceRecords, ...records]
        } else {
            contentsWithNoRefs.push(contents[i].uri)
        }

        if (allReferenceRecords.length >= 200) {
            const t2 = new Date().getTime()
            console.log("Last content is", i, "of", contents.length)
            console.log("Got 200 after", (t2 - t1)/1000, "upd/s", 1000 * allReferenceRecords.length / (t2-t1))
            t1 = t2
            await applyBulkReferencesUpdate(allReferenceRecords, updateTime);
            allReferenceRecords = [];
        }
    }

    if (allReferenceRecords.length > 0) {
        await applyBulkReferencesUpdate(allReferenceRecords, updateTime);
    }

    console.log("Marking contents with no refs", contentsWithNoRefs.length)
    if(contentsWithNoRefs.length > 0){
        await db.$executeRawUnsafe(`
            UPDATE "Content"
            SET "lastReferencesUpdate" = $1::TIMESTAMP
            WHERE uri IN (${contentsWithNoRefs.map((_, i) => `$${i + 2}`).join(", ")});
        `, updateTime.toISOString(), ...contentsWithNoRefs)
    }
}


async function applyBulkReferencesUpdate(referenceRecords: { uri: string, topicId: string, type: string }[], updateTime: Date) {
    if (referenceRecords.length === 0) return;

    const t1 = new Date().getTime()
    console.log(`Inserting ${referenceRecords.length} references...`);

    const escapeString = (str) => str.replace(/'/g, "''");

    const referenceUpdates = referenceRecords.map((r) => {
        return `(uuid_generate_v4(), '${r.uri}', '${escapeString(r.topicId)}', 'Weak')`
    })

    try {
        const result = await db.$executeRawUnsafe(`
            INSERT INTO "Reference" (id, "referencingContentId", "referencedTopicId", type)
            VALUES ${referenceUpdates.join(", ")}
            ON CONFLICT DO NOTHING
        `);
    } catch (e) {
        console.log("Error running query")
        console.log(`
            INSERT INTO "Reference" (id, "referencingContentId", "referencedTopicId", type)
            VALUES ${referenceUpdates.join(", ")}
            ON CONFLICT DO NOTHING
        `)
        console.log(e)
    }

    const t2 = new Date().getTime()
    console.log(`Updating content records...`);

    try {
        await db.$executeRawUnsafe(`
            UPDATE "Content"
            SET "lastReferencesUpdate" = $1::TIMESTAMP
            WHERE uri IN (${referenceRecords.map((_, i) => `$${i + 2}`).join(", ")});
        `, updateTime.toISOString(), ...referenceRecords.map((r) => r.uri));
    } catch (e) {
        console.log("Error running query")
        console.log(`
            UPDATE "Content"
            SET "lastReferencesUpdate" = $1::TIMESTAMP
            WHERE uri IN (${referenceRecords.map((_, i) => `$${i + 2}`).join(", ")});
        `)
        console.log(e)
    }


    const t3 = new Date().getTime()
    console.log("Bulk updates applied after", (t2-t1)/1000, "+", (t3-t2)/1000, "=", (t3-t1)/1000, "upd/s", referenceRecords.length / ((t3-t1)/1000));
}



export async function getPendingReferenceUpdatesCount(){
    const topics = await getTopicsWithSynonyms()

    const lastTopicUpdate = getLastSynonymsUpdate(topics)
    console.log("last topic update", lastTopicUpdate)

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

    let contents: ContentTextOrBlob[] = await db.content.findMany({
        select: {
            uri: true,
            text: true,
            textBlob: true,
            format: true,
            lastReferencesUpdate: true
        }
    })

    contents = contents.filter((c) => (!c.lastReferencesUpdate || new Date(c.lastReferencesUpdate).getTime() <= new Date(lastTopicUpdate).getTime()))

    return contents.length
}


export async function resetUpdateReferenceTimestamps(){
    await db.topic.updateMany({
        data: {
            lastSynonymsChange: null
        }
    })
    await db.content.updateMany({
        data: {
            lastReferencesUpdate: null
        }
    })
}


export async function applyReferencesUpdateToContent(uri: string){
    const updateTime = new Date()
    const content = await db.content.findUnique({
        select: {
            uri: true,
            text: true,
            textBlob: true,
            format: true,
            lastReferencesUpdate: true
        },
        where: {
            uri: uri
        }
    })


    const topics = await getTopicsWithSynonyms()

    const lastTopicUpdate = getLastSynonymsUpdate(topics)

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

    const updates = await updateReferencesForContent(content, synonymsToTopicsMap)

    console.log("updates", updates)
    await applyBulkReferencesUpdate(updates, updateTime)
}