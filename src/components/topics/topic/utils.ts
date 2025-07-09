import {EditorStatus} from "@/lib/types";

import {
    BooleanProp,
    DateProp,
    isBooleanProp,
    isDateProp,
    isNumberProp,
    isStringListProp, isStringProp, NumberProp, StringListProp, StringProp,
    TopicProp,
    TopicVersionStatus
} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {areArraysEqual, gett} from "@/utils/arrays";
import {$Typed} from "@atproto/api";


export type PropValueType = "ar.cabildoabierto.wiki.topicVersion#stringListProp" |
    "ar.cabildoabierto.wiki.topicVersion#stringProp" |
    "ar.cabildoabierto.wiki.topicVersion#dateProp" |
    "ar.cabildoabierto.wiki.topicVersion#numberProp" |
    "ar.cabildoabierto.wiki.topicVersion#booleanProp"

export type PropValue = TopicProp["value"]

export function isKnownProp(p: PropValue): p is $Typed<StringListProp> | $Typed<StringProp> | $Typed<DateProp> | $Typed<NumberProp> | $Typed<BooleanProp> {
    return p.$type == "ar.cabildoabierto.wiki.topicVersion#stringListProp" ||
        p.$type == "ar.cabildoabierto.wiki.topicVersion#stringProp" ||
        p.$type == "ar.cabildoabierto.wiki.topicVersion#dateProp" ||
        p.$type == "ar.cabildoabierto.wiki.topicVersion#numberProp" ||
        p.$type == "ar.cabildoabierto.wiki.topicVersion#booleanProp"
}

export function propsEqualValue(a: PropValue, b: PropValue) {
    if(a.$type != b.$type) return false
    if(isStringListProp(a) && isStringListProp(b)){
        return areArraysEqual(a.value, b.value)
    } else if(isStringProp(a) && isStringProp(b)){
        return a.value == b.value
    } else if(isDateProp(a) && isDateProp(b)){
        return a.value == b.value
    } else if(isBooleanProp(a) && isBooleanProp(b)){
        return a.value == b.value
    } else if(isNumberProp(a) && isNumberProp(b)){
        return a.value == b.value
    } else {
        throw Error(`Tipo de propiedad desconocido: ${a.$type} ${b.$type}`)
    }
}


export function getTopicCategories(props?: TopicProp[]): string[] {
    const c = getTopicProp("Categorías", props)
    return c && isStringListProp(c.value) ? c.value.value : []
}


export function getAcceptCount(status: TopicVersionStatus){
    let accepts = 0
    status.voteCounts.forEach(v => {
        accepts += v.accepts
    })
    return accepts
}


export function getRejectCount(status: TopicVersionStatus){
    let rejects = 0
    status.voteCounts.forEach(v => {
        rejects += v.rejects
    })
    return rejects
}


export function getTopicProp(prop: string, props?: TopicProp[]): TopicProp | null {
    const d = getPropsDict(props)
    if(d.has(prop)){
        return gett(d, prop)
    } else {
        return null
    }
}


export function getTopicTitle(topic: {id: string, props?: TopicProp[]}): string {
    const t = getTopicProp("Título", topic.props)
    return t && isStringProp(t.value) && t.value.value != null ? t.value.value : topic.id
}


export function getTopicSynonyms(topic: {id: string, props?: TopicProp[]}): string[] {
    const s = getTopicProp("Sinónimos", topic.props)
    const t = getTopicProp("Título", topic.props)

    let synonyms = [topic.id]
    if(s && isStringListProp(s.value)){
        synonyms = [...synonyms, ...s.value.value]
    }
    if(t && isStringProp(t.value)) {
        synonyms.push(t.value.value)
    }
    return synonyms
}


export function getTopicProtection(props: TopicProp[]): string {
    const p = getTopicProp("Protección", props)
    return p && isStringProp(p.value) ? p.value.value : "Principiante"
}


export function getPropsDict(props?: TopicProp[]) {
    if(!props) return new Map<string, TopicProp>()
    return new Map<string, TopicProp>(props.map(p => [p.name, p]))
}


export function isTopicVersionDemonetized(topicVersion: {}) {
    return false
}

export function validEntityName(name: string) {
    return name.length >= 2 && name.length < 100 && !name.includes("/");
}

export const permissionToPrintable = (level: string) => {
    if (level == "Administrator") {
        return "Administrador"
    } else if (level == "Beginner") {
        return "Editor aprendiz"
    } else if (level == "Editor") {
        return "Editor"
    }
}

export const permissionToNumber = (level: string) => {
    if (level == "Administrator") {
        return 2
    } else if (level == "Beginner" || level == "Principiante") {
        return 0
    } else if (level == "Editor") {
        return 1
    }
}

export const hasEditPermission = (user: {editorStatus: EditorStatus} | null, level: string) => {
    return user && permissionToNumber(user.editorStatus) >= permissionToNumber(level)
}
