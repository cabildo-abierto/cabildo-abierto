"use client"

import {TopicProps, TopicVersionProps} from "../../app/lib/definitions";
import {updateSynonymsInTopic} from "../../actions/write/topic";
import { ListEditor } from "../ui-utils/list-editor";
import {WikiEditorState} from "./topic-content-expanded-view-header";


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
        if(v.content.topicVersion.synonyms && isAccepted(v)){
            synonyms = unique(JSON.parse(v.content.topicVersion.synonyms) as string[])
        }
    }
    return synonyms
}



export const SynonymsEditor = ({topic, onClose}: {
    topic: TopicProps
    onClose: () => void
}) => {
    const currentSynonyms = getTopicSynonyms(topic)


    const onSave = async (synonyms: string[]) => {
        const {error} = await updateSynonymsInTopic({topicId: topic.id, synonyms})
        if(!error){
            onClose()
        }
        return {error}
    }

    return <div className={"mt-8"}>
        <h3 className={"mb-6"}>
            Editar sinónimos
        </h3>
        <ListEditor
            initialValue={currentSynonyms}
            onSave={onSave}
            onClose={onClose}
            newItemText={"Nuevo sinónimo"}
            options={null}
        />
    </div>
}