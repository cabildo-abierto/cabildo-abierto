import {TopicProp} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";


export const TopicProperty = ({p}: {p: TopicProp}) => {
    if(p.dataType == "string"){
        return <div>
            <span className={"font-semibold"}>{p.name}:</span> {p.value}
        </div>
    } else if(p.dataType == "string[]"){
        const values: string[] = JSON.parse(p.value)
        return <div>
            <span className={"font-semibold"}>{p.name}:</span> {values.join(", ")}
        </div>
    }
}