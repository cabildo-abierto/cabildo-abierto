"use client"

import {TopicProps, TopicVersionProps} from "../app/lib/definitions";
import {updateSynonymsInTopic} from "../actions/topics";
import { ListEditor } from "./ui-utils/list-editor";


export function isAccepted(version: TopicVersionProps){
    return true
}


export function unique<T>(list: T[]): T[]{
    return Array.from(new Set(list))
}


export function getTopicSynonyms(topics: TopicProps){
    let synonyms: string[] = []
    for(let i = 0; i < topics.versions.length; i++){
        const v = topics.versions[i]
        if(v.synonyms && isAccepted(v)){
            synonyms = unique(JSON.parse(v.synonyms) as string[])
        }
    }
    return synonyms
}



export const SynonymsEditor = ({topic, setEditing}: {topic: TopicProps, setEditing: (v: boolean) => void}) => {
    const currentSynonyms = getTopicSynonyms(topic)


    const onSave = async (synonyms: string[]) => {
        const {error} = await updateSynonymsInTopic({topicId: topic.id, synonyms})
        if(!error){
            setEditing(false)
        }
        return {error}
    }

    return <ListEditor
        initialValue={currentSynonyms}
        onSave={onSave}
        onClose={() => {setEditing(false)}}
        newItemText={"Nuevo sinónimo"}
    />
}