"use client"

import {TopicProps} from "../../app/lib/definitions";
import {updateSynonymsInTopic} from "../../actions/write/topic";
import { ListEditor } from "../ui-utils/list-editor";
import {useSWRConfig} from "swr";



export const SynonymsEditor = ({topic, onClose}: {
    topic: TopicProps
    onClose: () => void
}) => {
    const currentSynonyms = topic.synonyms ?? []
    const {mutate} = useSWRConfig()


    const onSave = async (synonyms: string[]) => {
        const {error} = await updateSynonymsInTopic({topicId: topic.id, synonyms})
        mutate("/api/topics")
        mutate("/api/topic-feed")
        mutate("/api/topic-history")
        await mutate("/api/topic/" + topic.id)
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