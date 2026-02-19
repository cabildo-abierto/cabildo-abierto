import {ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api";
import {areArraysEqual} from "./arrays";


export type PropValue = ArCabildoabiertoWikiTopicVersion.TopicProp["value"]


export function propsEqualValue(a: PropValue, b: PropValue) {
    if(a.$type != b.$type) return false
    if(ArCabildoabiertoWikiTopicVersion.isStringListProp(a) && ArCabildoabiertoWikiTopicVersion.isStringListProp(b)){
        return areArraysEqual(a.value, b.value)
    } else if(ArCabildoabiertoWikiTopicVersion.isStringProp(a) && ArCabildoabiertoWikiTopicVersion.isStringProp(b)){
        return a.value == b.value
    } else if(ArCabildoabiertoWikiTopicVersion.isDateProp(a) && ArCabildoabiertoWikiTopicVersion.isDateProp(b)){
        return a.value == b.value
    } else if(ArCabildoabiertoWikiTopicVersion.isBooleanProp(a) && ArCabildoabiertoWikiTopicVersion.isBooleanProp(b)){
        return a.value == b.value
    } else if(ArCabildoabiertoWikiTopicVersion.isNumberProp(a) && ArCabildoabiertoWikiTopicVersion.isNumberProp(b)){
        return a.value == b.value
    } else {
        throw Error(`Tipo de propiedad desconocido: ${a.$type} ${b.$type}`)
    }
}


export function propsEqual(props1: ArCabildoabiertoWikiTopicVersion.TopicProp[], props2: ArCabildoabiertoWikiTopicVersion.TopicProp[]) {
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


export function propsIncluded(props1: ArCabildoabiertoWikiTopicVersion.TopicProp[], props2: ArCabildoabiertoWikiTopicVersion.TopicProp[]) {
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