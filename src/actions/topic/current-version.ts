"use server"
import {db} from "../../db";
import {TopicProps} from "../../app/lib/definitions";
import {revalidateTags} from "../admin";
import {setTopicCategories, setTopicSynonyms} from "./utils";


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

    let updates = []
    if(!arraysEqual(prevCategories, newCategories)){
        updates = setTopicCategories(topic.id, newCategories)
    }

    if(!arraysEqual(prevSynonyms, newSynonyms)){
        updates = [...updates, ...setTopicSynonyms(topic.id, newSynonyms)]
    }

    await db.$transaction(updates)

    await revalidateTags(["topic:"+topic.id, "topics"])
}