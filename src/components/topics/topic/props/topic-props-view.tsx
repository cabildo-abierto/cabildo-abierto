import {ListEditor} from "../../../../../modules/ui-utils/src/list-editor";
import {addDefaults} from "@/components/topics/topic/topic-props-editor";
import {formatIsoDate} from "@/utils/dates";
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"
import Image from "next/image"


const TopicStringPropViewValue = ({name, value}: {name: string, value: string}) => {
    if(name == "Foto"){
        return <Image
            src={value}
            alt={name}
            width={400}
            height={400}
            className={"w-36 h-auto object-contain"}
        />
    } else {
        return <div className={"text-sm"}>{value}</div>
    }
}


export const TopicPropView = ({p}: {p: ArCabildoabiertoWikiTopicVersion.TopicProp}) => {
    return <div className={"flex space-x-8 w-full items-center"}>
        <div className={"w-[100px] text-sm"}>
            {p.name}
        </div>
        {ArCabildoabiertoWikiTopicVersion.isStringListProp(p.value) && <ListEditor
            items={p.value.value}
        />}
        {ArCabildoabiertoWikiTopicVersion.isStringProp(p.value) && <TopicStringPropViewValue
            name={p.name}
            value={p.value.value}
        />}
        {ArCabildoabiertoWikiTopicVersion.isNumberProp(p.value) && <div className={"text-sm"}>
            {p.value.value}
        </div>}
        {ArCabildoabiertoWikiTopicVersion.isDateProp(p.value) && <div className={"text-sm"}>
            {formatIsoDate(p.value.value, false)}
        </div>}
    </div>
}


export const TopicPropsView = ({topic}: {topic: ArCabildoabiertoWikiTopicVersion.TopicView}) => {
    const props = addDefaults(topic.props, topic)

    return <div className={"border p-4 space-y-6 mx-2 my-4"}>
        <div className={"font-semibold flex items-center space-x-2"}>
            <div className={"uppercase text-sm"}>Propiedades</div>
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