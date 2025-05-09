import {
    isStringListProp,
    isStringProp,
    TopicProp,
    TopicView
} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {ListEditor} from "../../../../../modules/ui-utils/src/list-editor";
import {addDefaults} from "@/components/topics/topic/topic-props-editor";


export const TopicPropView = ({p}: {p: TopicProp}) => {
    return <div className={"flex space-x-8 w-full items-center"}>
        <div className={"w-[100px] text-sm"}>
            {p.name}
        </div>
        {isStringListProp(p.value) && <ListEditor
            items={p.value.value}
        />}
        {isStringProp(p.value) && <div>
            {p.value.value}
        </div>}
    </div>
}


export const TopicPropsView = ({topic}: {topic: TopicView}) => {
    const props = addDefaults(topic.props, topic)

    return <div className={"border bg-[var(--background-dark)] rounded p-4 space-y-6 mx-2 my-4"}>
        <div className={"font-semibold flex items-center space-x-2"}>
            <div>Propiedades</div>
        </div>
        <div className={"space-y-6"}>
            {props.map((p, index) => {
                return <div key={index}>
                    <TopicPropView p={p} />
                </div>
            })}
        </div>
    </div>
}