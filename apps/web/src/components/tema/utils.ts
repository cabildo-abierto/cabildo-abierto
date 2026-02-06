import {gett, PropValue} from "@cabildo-abierto/utils";
import {$Typed, EditorStatus} from "@cabildo-abierto/api";
import { ArCabildoabiertoWikiTopicVersion } from "@cabildo-abierto/api";


export type PropValueType = "ar.cabildoabierto.wiki.topicVersion#stringListProp" |
    "ar.cabildoabierto.wiki.topicVersion#stringProp" |
    "ar.cabildoabierto.wiki.topicVersion#dateProp" |
    "ar.cabildoabierto.wiki.topicVersion#numberProp" |
    "ar.cabildoabierto.wiki.topicVersion#booleanProp"

export function isKnownProp(p: PropValue): p is $Typed<ArCabildoabiertoWikiTopicVersion.StringListProp> | $Typed<ArCabildoabiertoWikiTopicVersion.StringProp> | $Typed<ArCabildoabiertoWikiTopicVersion.DateProp> | $Typed<ArCabildoabiertoWikiTopicVersion.NumberProp> | $Typed<ArCabildoabiertoWikiTopicVersion.BooleanProp> {
    return p.$type == "ar.cabildoabierto.wiki.topicVersion#stringListProp" ||
        p.$type == "ar.cabildoabierto.wiki.topicVersion#stringProp" ||
        p.$type == "ar.cabildoabierto.wiki.topicVersion#dateProp" ||
        p.$type == "ar.cabildoabierto.wiki.topicVersion#numberProp" ||
        p.$type == "ar.cabildoabierto.wiki.topicVersion#booleanProp"
}


export function getTopicCategories(props?: ArCabildoabiertoWikiTopicVersion.TopicProp[]): string[] {
    const c = getTopicProp("Categorías", props)
    return c && ArCabildoabiertoWikiTopicVersion.isStringListProp(c.value) ? c.value.value : []
}


export function getAcceptCount(status: ArCabildoabiertoWikiTopicVersion.TopicVersionStatus){
    let accepts = 0
    status.voteCounts.forEach(v => {
        accepts += v.accepts
    })
    return accepts
}


export function getRejectCount(status: ArCabildoabiertoWikiTopicVersion.TopicVersionStatus){
    let rejects = 0
    status.voteCounts.forEach(v => {
        rejects += v.rejects
    })
    return rejects
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
    return t && ArCabildoabiertoWikiTopicVersion.isStringProp(t.value) && t.value.value != null ? t.value.value : topic.id
}


export function getTopicProtection(props: ArCabildoabiertoWikiTopicVersion.TopicProp[]): string {
    const p = getTopicProp("Protección", props)
    return p && ArCabildoabiertoWikiTopicVersion.isStringProp(p.value) ? p.value.value : "Principiante"
}


export function getPropsDict(props?: ArCabildoabiertoWikiTopicVersion.TopicProp[]) {
    if(!props) return new Map<string, ArCabildoabiertoWikiTopicVersion.TopicProp>()
    return new Map<string, ArCabildoabiertoWikiTopicVersion.TopicProp>(props.map(p => [p.name, p]))
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