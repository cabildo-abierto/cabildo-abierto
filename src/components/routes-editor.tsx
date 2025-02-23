"use client"

import {currentCategories} from "./utils";
import { TopicProps } from "../app/lib/definitions";
import {updateCategoriesInTopic} from "../actions/topics";
import {useCategories} from "../hooks/contents";
import {ListEditor} from "./ui-utils/list-editor";


export const RoutesEditor = ({topic, setEditing}: {topic: TopicProps, setEditing: (v: boolean) => void}) => {
    const current = currentCategories(topic)
    const {categories: availableCategories} = useCategories()


    async function saveCategories(categories: string[]){
        await updateCategoriesInTopic({topicId: topic.id, categories})
        setEditing(false)
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