import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"

export const TopicProperty = ({p}: {p: ArCabildoabiertoWikiTopicVersion.TopicProp}) => {
    if(ArCabildoabiertoWikiTopicVersion.isStringProp(p.value)){
        return <div>
            <span className={"font-semibold"}>{p.name}:</span> {p.value.value}
        </div>
    } else if(ArCabildoabiertoWikiTopicVersion.isStringListProp(p.value)){
        const values: string[] = p.value.value
        return <div>
            <span className={"font-semibold"}>{p.name}:</span> {values.join(", ")}
        </div>
    }
}