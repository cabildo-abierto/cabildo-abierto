"use client"

import { TopicProps } from "../../app/lib/definitions";
import {updateCategoriesInTopic} from "../../actions/write/topic";
import {useCategories} from "../../hooks/contents";
import {ListEditor} from "../ui-utils/list-editor";
import {useSWRConfig} from "swr";
import {getFullTopicCategories} from "./utils";


export const CategoriesEditor = ({topic, onClose}: {
    topic: TopicProps
    onClose: () => void
}) => {
    const current = getFullTopicCategories(topic)
    const {categories: availableCategories} = useCategories()
    const {mutate} = useSWRConfig()


    async function saveCategories(categories: string[]) {
        await updateCategoriesInTopic({topicId: topic.id, categories})
        await mutate("/api/topics-by-categories/popular")
        await mutate("/api/topic/" + topic.id)
        onClose()
        return {}
    }

    return <div className={"mt-8"}>
        <h3 className={"mb-6"}>
            Editar categorías
        </h3>
        <ListEditor
            initialValue={current}
            options={availableCategories ? availableCategories.map(({category}) => (category)).filter(c => c != "Sin categoría") : undefined}
            onSave={saveCategories}
            onClose={onClose}
            newItemText={"Nueva categoría"}
        />
    </div>
}