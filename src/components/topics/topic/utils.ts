import {
    BothContributionsProps, EditorStatus
} from "@/lib/types";

import {TopicHistory, TopicProp, TopicVersionStatus} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {gett} from "@/utils/arrays";


export function getTopicCategories(props?: TopicProp[]): string[]{
    return getTopicProp("Categorías", props) as string[] ?? []
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


export function getTopicProp(prop: string, props?: TopicProp[]){
    const d = getPropsDict(props)
    if(d.has(prop)){
        const p = gett(d, prop)

        if(p.dataType == "string" || !p.dataType){
            return p.value
        } else if(p.dataType == "string[]") {
            return JSON.parse(p.value) as string[]
        } else {
            throw Error(`Tipo de propiedad de tema desconocido (${p.dataType})) en propiedad ${p.value}.`)
        }
    } else {
        return null
    }
}


export function getTopicTitle(topic: {id: string, props?: TopicProp[]}) {
    return getTopicProp("Título", topic.props) ?? topic.id
}


export function getTopicSynonyms(topic: {id: string, props?: TopicProp[]}): string[] {
    const s = getTopicProp("Sinónimos", topic.props) as string[] | null
    const t = getTopicProp("Título", topic.props) as string | null

    return [topic.id, ...(s ?? []), ...(t ? [t] : [])]
}


export function getTopicProtection(props: TopicProp[]): string {
    return getTopicProp("Protección", props) as string ?? "Principiante"
}


export function getPropsDict(props?: TopicProp[]) {
    if(!props) return new Map<string, TopicProp>()
    return new Map<string, TopicProp>(props.map(p => [p.name, p]))
}


export function isTopicVersionDemonetized(topicVersion: {}) {
    return false
}

export function contributionsToProportionsMap(contributions: BothContributionsProps, author: string) {
    let map = {}

    if (!contributions.all.some(([a, _]) => (a == author))) {
        contributions.all.push([author, 0])
    }

    let total = 0
    for (let i = 0; i < contributions.monetized.length; i++) {
        const [author, charCount] = contributions.monetized[i]
        total += charCount
    }

    const monetized = total > 0

    for (let i = 0; i < contributions.all.length; i++) {
        const [author, charCount] = contributions.all[i]
        map[author] = 1.0 / contributions.all.length * (monetized ? 0.1 : 1)
    }

    if (total > 0) {
        for (let i = 0; i < contributions.monetized.length; i++) {
            const [author, charCount] = contributions.monetized[i]
            map[author] += charCount / total * 0.9
        }
    }

    return map
}

export function getEntityMonetizedContributions(topic: TopicHistory, version: number){
    const authors = new Map()
    for(let i = 0; i <= version; i++){
        if(!isTopicVersionDemonetized(topic.versions[i])){
            const author = topic.versions[i].author.did

            if(authors.has(author)){
                authors.set(author, authors.get(author) + topic.versions[i].addedChars)
            } else {
                authors.set(author, topic.versions[i].addedChars)
            }
        }
    }
    return Array.from(authors)
}

export function getTopicMonetizedChars(topic: TopicHistory, version: number) {
    let monetizedCharsAdded = 0
    for (let i = 0; i <= version; i++) {
        if (!isTopicVersionDemonetized(topic.versions[i])) {
            monetizedCharsAdded += topic.versions[i].addedChars
        }
    }
    return monetizedCharsAdded
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
