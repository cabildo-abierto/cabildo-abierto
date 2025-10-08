import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"

export const TopicProperty = ({p}: {p: ArCabildoabiertoWikiTopicVersion.TopicProp}) => {
    if(ArCabildoabiertoWikiTopicVersion.isStringProp(p.value)){
        return <div className={"break-all"}>
            <span className={"font-semibold"}>{p.name}:</span> <span>
                {p.value.value}
            </span>
        </div>
    } else if(ArCabildoabiertoWikiTopicVersion.isStringListProp(p.value)){
        const values: string[] = p.value.value
        return <div className={"break-all"}>
            <span className={"font-semibold"}>{p.name}:
            </span> <span>
                {values.join(", ")}
            </span>
        </div>
    }
}