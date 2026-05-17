import {ArCabildoabiertoWikiTopic} from "@cabildo-abierto/api";
import {areArraysEqual} from "./arrays";


export type PropValue = ArCabildoabiertoWikiTopic.TopicProp["value"]


export function propsEqualValue(a: PropValue, b: PropValue) {
    if(a.$type != b.$type) return false
    if(ArCabildoabiertoWikiTopic.isStringListProp(a) && ArCabildoabiertoWikiTopic.isStringListProp(b)){
        return areArraysEqual(a.value, b.value)
    } else if(ArCabildoabiertoWikiTopic.isStringProp(a) && ArCabildoabiertoWikiTopic.isStringProp(b)){
        return a.value == b.value
    } else if(ArCabildoabiertoWikiTopic.isDateProp(a) && ArCabildoabiertoWikiTopic.isDateProp(b)){
        return a.value == b.value
    } else if(ArCabildoabiertoWikiTopic.isBooleanProp(a) && ArCabildoabiertoWikiTopic.isBooleanProp(b)){
        return a.value == b.value
    } else if(ArCabildoabiertoWikiTopic.isNumberProp(a) && ArCabildoabiertoWikiTopic.isNumberProp(b)){
        return a.value == b.value
    } else {
        throw Error(`Tipo de propiedad desconocido: ${a.$type} ${b.$type}`)
    }
}


export function propsEqual(props1: ArCabildoabiertoWikiTopic.TopicProp[], props2: ArCabildoabiertoWikiTopic.TopicProp[]) {
    if (props1.length != props2.length) {
        return false
    }
    for (let i = 0; i < props1.length; i++) {
        if (props1[i].name != props2[i].name || !propsEqualValue(props1[i].value, props2[i].value)) {
            return false
        }
    }
    return true
}


export function propsIncluded(props1: ArCabildoabiertoWikiTopic.TopicProp[], props2: ArCabildoabiertoWikiTopic.TopicProp[]) {
    if (props1.length > props2.length) {
        return false
    }
    for (let i = 0; i < props1.length; i++) {
        const inProps2 = props2.find(p => p.name == props1[i].name)
        if(!inProps2) return false
        if(!propsEqualValue(props1[i].value, inProps2.value)) return false
    }
    return true
}


export function getTopicIdFromTitle(title: string) {
    return title
        .normalize('NFKD') // separate accents from letters
        .replace(/[\u0300-\u036f]/g, '') // remove accent marks
        .toLowerCase()
        .trim()
        .replace(/&/g, ' y ')
        .replace(/[^a-z0-9\s-]/g, '') // remove special chars
        .replace(/[\s_-]+/g, '-') // collapse separators
        .replace(/^-+|-+$/g, '') // trim dashes
}