"use server"
import {db} from "../../db";
import {TopicHistoryProps, TopicProps} from "../../app/lib/definitions";
import {revalidateTags} from "../admin";
import {setTopicCategories, setTopicSynonyms} from "./utils";
import {getCurrentContentVersion, getCurrentVersion, getTopicLastEditFromVersions} from "../../components/topic/utils";
import {getTopicHistory} from "./topics";


function getTopicCategoriesFromVersions(topic: TopicHistoryProps){
    let categories = undefined
    for(let i = topic.versions.length - 1; i >= 0; i--){
        if(topic.versions[i].content.topicVersion.categories){
            categories = topic.versions[i].content.topicVersion.categories
        }
    }
    return categories ? JSON.parse(categories) : []
}


function getTopicSynonymsFromVersions(topic: TopicHistoryProps){
    let categories = undefined
    for(let i = topic.versions.length - 1; i >= 0; i--){
        if(topic.versions[i].content.topicVersion.synonyms){
            categories = topic.versions[i].content.topicVersion.synonyms
        }
    }
    return categories ? JSON.parse(categories) : []
}


function arraysEqual<T>(a: T[], b: T[]): boolean{
    return a.length === b.length && a.every((val, index) => val === b[index])
}


export async function deleteTopicVersion(topic: TopicProps, topicHistory: TopicHistoryProps, index: number){
    const prevCategories = topic.categories.map(c => (c.categoryId))
    const prevSynonyms = topic.synonyms

    const wasCurrentVersion = topic.currentVersion.uri == topicHistory.versions[index].uri


    topicHistory.versions = [...topicHistory.versions.slice(0, index), ...topicHistory.versions.slice(index+1)]
    const newCategories = getTopicCategoriesFromVersions(topicHistory)
    const newSynonyms = getTopicSynonymsFromVersions(topicHistory)
    let newCurrentVersionId
    if(wasCurrentVersion){
        newCurrentVersionId = topicHistory.versions[getCurrentContentVersion(topicHistory)].uri
    }

    const changedCategories = !arraysEqual(prevCategories, newCategories)

    let updates = []
    if(changedCategories){
        updates = setTopicCategories(topic.id, newCategories)
    }

    if(!arraysEqual(prevSynonyms, newSynonyms)){
        updates = [...updates, ...setTopicSynonyms(topic.id, newSynonyms)]
    }

    updates = [
        ...updates,
        db.topic.update({
            where: {
                id: topic.id,
            },
            data: {
                lastEdit: new Date(),
                currentVersionId: wasCurrentVersion ? newCurrentVersionId : undefined
            }
        })
    ]

    await db.$transaction(updates)

    await revalidateTags(["topic:"+topic.id, "topics", ...(changedCategories ? ["categories"] : [])])
}


export async function updateTopicsLastEdit() {
    const topics = await db.topic.findMany({
        select: {
            id: true,
            versions: {
                select: {
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
    });

    const updates = topics
        .map(t => ({
            id: t.id,
            lastEdit: getTopicLastEditFromVersions(t)
        }))
        .filter(t => t.lastEdit !== null);

    if (updates.length === 0) return;

    const ids = updates.map(({ id }) => id);
    const lastEdits = updates.map(({ lastEdit }) => lastEdit);

    const query = `
        UPDATE "Topic"
        SET "lastEdit" = CASE 
            ${updates.map((_, i) => `WHEN "id" = $${i * 2 + 2} THEN $${i * 2 + 1}`).join(" ")}
        END
        WHERE "id" IN (${ids.map((_, i) => `$${i * 2 + 2}`).join(", ")});
    `;

    await db.$executeRawUnsafe(query, ...lastEdits.flatMap((date, i) => [date, ids[i]]));
}


export async function updateTopicCurrentVersion(id: string){
    const {topicHistory: topic} = await getTopicHistory(id)

    const currentVersion = getCurrentContentVersion(topic)
    const uri = topic.versions[currentVersion].uri

    await db.topic.update({
        data: {
            currentVersionId: uri
        },
        where: {
            id
        }
    })
    console.log("Updated current version for", id, "with version", currentVersion, uri)
}


export async function updateTopicsCurrentVersion() {
    let topics = (await db.topic.findMany({
        select: {
            id: true,
            versions: {
                select: {
                    uri: true,
                    content: {
                        select: {
                            text: true,
                            textBlob: true,
                            numWords: true
                        }
                    }
                },
                orderBy: {
                    content: {
                        record: {
                            createdAt: "asc"
                        }
                    }
                }
            }
        }
    })).map(t => {
        return {
            ...t,
            versions: t.versions.map(v => {
                return {
                    ...v,
                    content: {
                        ...v.content,
                        hasText: v.content.text != null || v.content.numWords != null || v.content.textBlob != null
                    }
                }
            })
        }
    })

    console.log("Got all topics.");

    const updates = topics
        .map(t => ({
            id: t.id,
            currentVersionId: t.versions[getCurrentContentVersion(t)]?.uri || null
        }))
        .filter(t => t.currentVersionId !== null);

    if (updates.length === 0) return;

    // Construct a single SQL query with fully parameterized values
    const updateQuery = `
        UPDATE "Topic" AS t
        SET "currentVersionId" = c."uri"
        FROM (VALUES ${updates.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(", ")}) AS c(id, uri)
        WHERE t.id = c.id;
    `;

    const queryParams = updates.flatMap(({ id, currentVersionId }) => [id, currentVersionId]);

    await db.$executeRawUnsafe(updateQuery, ...queryParams);

    console.log("Done updating current versions.");
}




