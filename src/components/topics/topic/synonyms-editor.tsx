import { ListEditorWithSave } from "../../../../modules/ui-utils/src/list-editor";
import {useSWRConfig} from "swr";
import {TopicView} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {getTopicSynonyms} from "@/components/topics/topic/utils";


const updateSynonymsInTopic = async ({topicId, synonyms}: {topicId: string, synonyms: string[]}) => {
    return {error: "Sin implementar."}
}



export const SynonymsEditor = ({topic, onClose}: {
    topic: TopicView
    onClose: () => void
}) => {
    const currentSynonyms = getTopicSynonyms(topic) ?? []
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
        <ListEditorWithSave
            initialValue={currentSynonyms}
            onSave={onSave}
            onClose={onClose}
            newItemText={"Nuevo sinónimo"}
            options={null}
        />
    </div>
}