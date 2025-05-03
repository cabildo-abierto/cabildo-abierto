import {isStringListProp, isStringProp, TopicProp} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";


export const TopicProperty = ({p}: {p: TopicProp}) => {
    if(isStringProp(p.value)){
        return <div>
            <span className={"font-semibold"}>{p.name}:</span> {p.value.value}
        </div>
    } else if(isStringListProp(p.value)){
        const values: string[] = p.value.value
        return <div>
            <span className={"font-semibold"}>{p.name}:</span> {values.join(", ")}
        </div>
    }
}