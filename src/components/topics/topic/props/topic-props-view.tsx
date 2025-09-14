import {ListEditor} from "../../../../../modules/ui-utils/src/list-editor";
import {addDefaults} from "@/components/topics/topic/topic-props-editor";
import {formatIsoDate} from "@/utils/dates";
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"


export const TopicPropView = ({p}: {p: ArCabildoabiertoWikiTopicVersion.TopicProp}) => {
    return <div className={"flex space-x-8 w-full items-center"}>
        <div className={"w-[100px] text-sm"}>
            {p.name}
        </div>
        {ArCabildoabiertoWikiTopicVersion.isStringListProp(p.value) && <ListEditor
            items={p.value.value}
        />}
        {(ArCabildoabiertoWikiTopicVersion.isStringProp(p.value) || ArCabildoabiertoWikiTopicVersion.isNumberProp(p.value)) && <div>
            {p.value.value}
        </div>}
        {ArCabildoabiertoWikiTopicVersion.isDateProp(p.value) && <div>
            {formatIsoDate(p.value.value, false)}
        </div>}
    </div>
}


export const TopicPropsView = ({topic}: {topic: ArCabildoabiertoWikiTopicVersion.TopicView}) => {
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