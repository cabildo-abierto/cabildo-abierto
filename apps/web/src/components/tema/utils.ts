import {gett, PropValue} from "@cabildo-abierto/utils";
import {$Typed, EditorStatus} from "@cabildo-abierto/api";
import { ArCabildoabiertoWikiTopic } from "@cabildo-abierto/api";


export type PropValueType = "ar.cabildoabierto.wiki.topicVersion#stringListProp" |
    "ar.cabildoabierto.wiki.topicVersion#stringProp" |
    "ar.cabildoabierto.wiki.topicVersion#dateProp" |
    "ar.cabildoabierto.wiki.topicVersion#numberProp" |
    "ar.cabildoabierto.wiki.topicVersion#booleanProp"

export function isKnownProp(p: PropValue): p is $Typed<ArCabildoabiertoWikiTopic.StringListProp> | $Typed<ArCabildoabiertoWikiTopic.StringProp> | $Typed<ArCabildoabiertoWikiTopic.DateProp> | $Typed<ArCabildoabiertoWikiTopic.NumberProp> | $Typed<ArCabildoabiertoWikiTopic.BooleanProp> {
    return p.$type == "ar.cabildoabierto.wiki.topicVersion#stringListProp" ||
        p.$type == "ar.cabildoabierto.wiki.topicVersion#stringProp" ||
        p.$type == "ar.cabildoabierto.wiki.topicVersion#dateProp" ||
        p.$type == "ar.cabildoabierto.wiki.topicVersion#numberProp" ||
        p.$type == "ar.cabildoabierto.wiki.topicVersion#booleanProp"
}


export function getTopicCategories(props?: ArCabildoabiertoWikiTopic.TopicProp[]): string[] {
    const c = getTopicProp("Categorías", props)
    return c && ArCabildoabiertoWikiTopic.isStringListProp(c.value) ? c.value.value : []
}


export function getAcceptCount(status: ArCabildoabiertoWikiTopic.TopicVersionStatus){
    let accepts = 0
    status.voteCounts.forEach(v => {
        accepts += v.accepts
    })
    return accepts
}


export function getRejectCount(status: ArCabildoabiertoWikiTopic.TopicVersionStatus){
    let rejects = 0
    status.voteCounts.forEach(v => {
        rejects += v.rejects
    })
    return rejects
}


export function getTopicProp(prop: string, props?: ArCabildoabiertoWikiTopic.TopicProp[]): ArCabildoabiertoWikiTopic.TopicProp | null {
    const d = getPropsDict(props)
    if(d.has(prop)){
        return gett(d, prop)
    } else {
        return null
    }
}


export function getTopicTitle(topic: {id: string, props?: ArCabildoabiertoWikiTopic.TopicProp[]}): string {
    const t = getTopicProp("Título", topic.props)
    return t && ArCabildoabiertoWikiTopic.isStringProp(t.value) && t.value.value != null ? t.value.value : topic.id
}


export function getTopicProtection(props: ArCabildoabiertoWikiTopic.TopicProp[]): string {
    const p = getTopicProp("Protección", props)
    return p && ArCabildoabiertoWikiTopic.isStringProp(p.value) ? p.value.value : "Principiante"
}


export function getPropsDict(props?: ArCabildoabiertoWikiTopic.TopicProp[]) {
    if(!props) return new Map<string, ArCabildoabiertoWikiTopic.TopicProp>()
    return new Map<string, ArCabildoabiertoWikiTopic.TopicProp>(props.map(p => [p.name, p]))
}

export function validEntityName(name: string) {
    return name.length >= 2 && name.length < 100 && !name.includes("/");
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