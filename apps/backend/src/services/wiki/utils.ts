
import {ArCabildoabiertoWikiTopic} from "@cabildo-abierto/api"
import {gett, unique} from "@cabildo-abierto/utils";
import {cleanText} from "@cabildo-abierto/utils";


export function getTopicCategories(props?: ArCabildoabiertoWikiTopic.TopicProp[], topicCategories?: string[], currentVersionCategories?: string): string[] {
    const c = getTopicProp("Categorías", props)
    const propsCategories = c && ArCabildoabiertoWikiTopic.isStringListProp(c.value) ? c.value.value : []

    return unique([
        ...propsCategories,
        ...(topicCategories ?? []),
        ...(currentVersionCategories ? JSON.parse(currentVersionCategories) : []) // deprecated
    ])
}


export function getTopicProp(prop: string, props?: ArCabildoabiertoWikiTopic.TopicProp[]): ArCabildoabiertoWikiTopic.TopicProp | null {
    const d = getPropsDict(props)
    if(d.has(prop)){
        return gett(d, prop)
    } else {
        return null
    }
}


export function getTopicTitle(topic: {props?: ArCabildoabiertoWikiTopic.TopicProp[]}): string | null {
    const t = getTopicProp("Título", topic.props)
    return t && ArCabildoabiertoWikiTopic.isStringProp(t.value) ? t.value.value : null
}


export function getTopicSynonyms(topic: {id: string, props?: ArCabildoabiertoWikiTopic.TopicProp[]}): string[] {
    const s = getTopicProp("Sinónimos", topic.props)

    return s && ArCabildoabiertoWikiTopic.isStringListProp(s.value) ? unique(s.value.value, cleanText) : []
}


export function getPropsDict(props?: ArCabildoabiertoWikiTopic.TopicProp[]) {
    if(!props) return new Map<string, ArCabildoabiertoWikiTopic.TopicProp>()
    return new Map<string, ArCabildoabiertoWikiTopic.TopicProp>(props.map(p => [p.name, p]))
}