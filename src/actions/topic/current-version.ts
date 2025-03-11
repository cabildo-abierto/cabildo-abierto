"use server"
import {db} from "../../db";
import {TopicProps} from "../../app/lib/definitions";
import {revalidateTags} from "../admin";
import {setTopicCategories, setTopicSynonyms} from "./utils";
import {getTopicLastEditFromVersions} from "../../components/topic/utils";


function getTopicCategoriesFromVersions(topic: TopicProps){
    let categories = undefined
    for(let i = topic.versions.length - 1; i >= 0; i--){
        if(topic.versions[i].content.topicVersion.categories){
            categories = topic.versions[i].content.topicVersion.categories
        }
    }
    return categories ? JSON.parse(categories) : []
}


function getTopicSynonymsFromVersions(topic: TopicProps){
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


export async function onDeleteTopicVersion(topic: TopicProps, index: number){
    const prevCategories = topic.categories.map(c => (c.categoryId))
    const prevSynonyms = topic.synonyms

    topic.versions = [...topic.versions.slice(0, index), ...topic.versions.slice(index+1)]
    const newCategories = getTopicCategoriesFromVersions(topic)
    const newSynonyms = getTopicSynonymsFromVersions(topic)

    const changedCategories = !arraysEqual(prevCategories, newCategories)

    let updates = []
    if(changedCategories){
        updates = setTopicCategories(topic.id, newCategories)
    }

    if(!arraysEqual(prevSynonyms, newSynonyms)){
        updates = [...updates, ...setTopicSynonyms(topic.id, newSynonyms)]
    }

    updates = [...updates, db.topic.update({
        where: {
            id: topic.id,
        },
        data: {
            lastEdit: new Date()
        }
    })]

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
            lastEdit: getTopicLastEditFromVersions(t) // Ensure this function returns a valid Date object
        }))
        .filter(t => t.lastEdit !== null); // Remove null values

    if (updates.length === 0) return; // No updates needed

    // Build a parameterized CASE statement
    const updateCases = updates
        .map((_, index) => `"id" = $${index * 2 + 2} THEN $${index * 2 + 1}`)
        .join(" ");

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
