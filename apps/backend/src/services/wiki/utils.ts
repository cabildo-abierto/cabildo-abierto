
import {ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api"
import {gett, unique} from "@cabildo-abierto/utils";
import {cleanText} from "@cabildo-abierto/utils";


export function getTopicCategories(props?: ArCabildoabiertoWikiTopicVersion.TopicProp[], topicCategories?: string[], currentVersionCategories?: string): string[] {
    const c = getTopicProp("Categorías", props)
    const propsCategories = c && ArCabildoabiertoWikiTopicVersion.isStringListProp(c.value) ? c.value.value : []

    return unique([
        ...propsCategories,
        ...(topicCategories ?? []),
        ...(currentVersionCategories ? JSON.parse(currentVersionCategories) : []) // deprecated
    ])
}


export function getTopicProp(prop: string, props?: ArCabildoabiertoWikiTopicVersion.TopicProp[]): ArCabildoabiertoWikiTopicVersion.TopicProp | null {
    const d = getPropsDict(props)
    if(d.has(prop)){
        return gett(d, prop)
    } else {
        return null
    }
}


export function getTopicTitle(topic: {id: string, props?: ArCabildoabiertoWikiTopicVersion.TopicProp[]}): string {
    const t = getTopicProp("Título", topic.props)
    return t && ArCabildoabiertoWikiTopicVersion.isStringProp(t.value) ? t.value.value : topic.id
}


export function getTopicSynonyms(topic: {id: string, props?: ArCabildoabiertoWikiTopicVersion.TopicProp[]}): string[] {
    const s = getTopicProp("Sinónimos", topic.props)

    return s && ArCabildoabiertoWikiTopicVersion.isStringListProp(s.value) ? unique(s.value.value, cleanText) : []
}


export function getPropsDict(props?: ArCabildoabiertoWikiTopicVersion.TopicProp[]) {
    if(!props) return new Map<string, ArCabildoabiertoWikiTopicVersion.TopicProp>()
    return new Map<string, ArCabildoabiertoWikiTopicVersion.TopicProp>(props.map(p => [p.name, p]))
}