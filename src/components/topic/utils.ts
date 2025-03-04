import {TopicProps, TopicVersionProps} from "../../app/lib/definitions";


export function getTopicCategories(topic: {id: string, versions: {categories?: string}[]}){
    let categories = []
    topic.versions.forEach((t) => {
        const newCategories = t.categories
        if(newCategories){
            categories = JSON.parse(newCategories)
        }
    })
    return categories
}


export function getTopicTitle(topic: {id: string, versions: {title?: string}[]}){
    let title = topic.id
    topic.versions.forEach(({title: newTitle}) => {
        if(newTitle){
            title = newTitle
        }
    })
    return title
}


export function getFullTopicTitle(topic: TopicProps){
    let title = topic.id
    topic.versions.forEach((t) => {
        const newTitle = t.content.topicVersion.title
        if(newTitle){
            title = newTitle
        }
    })
    return title
}


export function getFullTopicCategories(topic: TopicProps){
    let categories = []
    topic.versions.forEach((t) => {
        const newCategories = t.content.topicVersion.categories
        if(newCategories){
            categories = JSON.parse(newCategories)
        }
    })
    return categories
}


export function getCurrentContentVersion(topic: {
    versions: {
        content?: {text?: string, textBlob?: {cid: string}, numWords?: number}}[]}, version?: number){
    if(version == null) version = topic.versions.length-1
    let lastContent = 0
    for(let i = 0; i <= version; i++){
        if(topic.versions[i].content.text || topic.versions[i].content.textBlob || topic.versions[i].content.numWords != null){
            lastContent = i
        }
    }
    return lastContent
}