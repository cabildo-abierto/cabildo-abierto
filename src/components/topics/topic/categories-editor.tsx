import {useCategories} from "@/hooks/api";
import {ListEditorWithSave} from "../../../../modules/ui-utils/src/list-editor";
import {useSWRConfig} from "swr";
import {getTopicCategories} from "./utils";
import {TopicView} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";


const updateCategoriesInTopic = async ({topicId, categories}: {topicId: string, categories: string[]}) => {

}


export const CategoriesEditor = ({topic, onClose}: {
    topic: TopicView
    onClose: () => void
}) => {
    const current = getTopicCategories(topic.props)
    const {data: availableCategories} = useCategories()
    const {mutate} = useSWRConfig()


    async function saveCategories(categories: string[]) {
        await updateCategoriesInTopic({topicId: topic.id, categories})
        await mutate("/api/topics-by-categories/popular")
        await mutate("/api/topic/" + topic.id)
        await mutate("/api/topic-history/" + topic.id)
        onClose()
        return {}
    }

    return <div className={"mt-8"}>
        <h3 className={"mb-6"}>
            Editar categorías
        </h3>
        <ListEditorWithSave
            initialValue={current}
            options={availableCategories ? availableCategories.map(({category}) => (category)).filter(c => c != "Sin categoría") : undefined}
            onSave={saveCategories}
            onClose={onClose}
            newItemText={"Nueva categoría"}
        />
    </div>
}