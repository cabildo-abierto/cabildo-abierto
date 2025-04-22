import {
    BothContributionsProps,
    TopicHistoryProps,
    TopicProps,
    UserProps
} from "@/lib/types";

import {max} from "../../../utils/arrays";


export function getTopicCategories(topic: {id: string, categories: {categoryId: string}[]}){
    return topic.categories ? topic.categories.map(({categoryId}) => categoryId) : []
}


export function getTopicTitle(topic: {id: string}){
    return topic.id
}


export function getFullTopicTitle(topic: TopicProps){
    return topic.id
}


export function getFullTopicCategories(topic: TopicProps){
    return topic.categories.map(({categoryId}) => categoryId)
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

export function getEntityMonetizedContributions(topic: TopicHistoryProps, version: number){
    const authors = new Map()
    for(let i = 0; i <= version; i++){
        if(!isTopicVersionDemonetized(topic.versions[i])){
            const author = topic.versions[i].author.did

            if(authors.has(author)){
                authors.set(author, authors.get(author) + topic.versions[i].content.topicVersion.charsAdded)
            } else {
                authors.set(author, topic.versions[i].content.topicVersion.charsAdded)
            }
        }
    }
    return Array.from(authors)
}

export function getTopicMonetizedChars(topic: TopicHistoryProps, version: number) {
    let monetizedCharsAdded = 0
    for (let i = 0; i <= version; i++) {
        if (!isTopicVersionDemonetized(topic.versions[i])) {
            monetizedCharsAdded += topic.versions[i].content.topicVersion.charsAdded
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
    } else if (level == "Beginner") {
        return 0
    } else if (level == "Editor") {
        return 1
    }
}

export const hasEditPermission = (user: UserProps | null, level: string) => {
    return user && permissionToNumber(user.editorStatus) >= permissionToNumber(level)
}
