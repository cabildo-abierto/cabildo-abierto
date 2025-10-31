import {TopicProp} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {TitleInput} from "@/components/writing/article/title-input";
import {produce} from "immer";
import {ListEditor} from "@/components/layout/utils/list-editor";
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api"
import {useCategories} from "@/queries/getters/useTopics";
import {getTopicTitle} from "@/components/topics/topic/utils";
import {useCallback} from "react";


export const TopicHeaderEditor = ({
    topicId,
    props,
    setProps
}: {
    topicId: string
    props?: TopicProp[]
    setProps: (props: TopicProp[]) => void
}) => {
    const {data} = useCategories()
    const cats = props.find(p => p.name == "Categorías")

    const setProp = useCallback((cats: string[]) => {
        setProps(produce(props, draft => {
            const i = props.findIndex(p => p.name == "Categorías")
            if(i != -1) {
                draft[i].value = {
                    $type: "ar.cabildoabierto.wiki.topicVersion#stringListProp",
                    value: cats
                }
            }
        }))
    }, [props, setProps, cats])

    const title = getTopicTitle({id: topicId, props})

    const setTitle = useCallback((t: string) => {
        setProps(produce(props, draft => {
            const i = props.findIndex(p => p.name == "Título")
            console.log("props", props, i)
            if(i != -1) {
                draft[i].value = {
                    $type: "ar.cabildoabierto.wiki.topicVersion#stringProp",
                    value: t
                }
            }
        }))
    }, [props, setProps])

    return <div className="flex flex-col py-1 mb-2 w-full sm:space-y-2" id={"topic-header"}>
        <TitleInput title={title} onChange={setTitle}/>
        {ArCabildoabiertoWikiTopicVersion.isStringListProp(cats.value) && <ListEditor
            items={cats.value.value}
            setItems={setProp}
            newItemText={"Agregar categoría"}
            options={data}
        />}
    </div>
}