"use client"

import {currentCategories} from "../utils";
import { TopicProps } from "../../app/lib/definitions";
import {updateCategoriesInTopic} from "../../actions/topics";
import {useCategories} from "../../hooks/contents";
import {ListEditor} from "../ui-utils/list-editor";
import {useSWRConfig} from "swr";


export const CategoriesEditor = ({topic, setEditing}: {topic: TopicProps, setEditing: (v: boolean) => void}) => {
    const current = currentCategories(topic)
    const {categories: availableCategories} = useCategories()
    const {mutate} = useSWRConfig()


    async function saveCategories(categories: string[]){
        await updateCategoriesInTopic({topicId: topic.id, categories})
        setEditing(false)
        mutate("/api/map-topics")
        mutate("/api/topics")
        mutate("/api/topic-feed")
        mutate("/topic/"+topic.id)
        return {}
    }

    return <ListEditor
        initialValue={current}
        options={availableCategories}
        onSave={saveCategories}
        onClose={() => {setEditing(false)}}
        newItemText={"Nueva categoría"}
    />
}