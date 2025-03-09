import {TopicProps} from "../../app/lib/definitions";


export function getTopicCategories(topic: {id: string, categories: {categoryId: string}[]}){
    return topic.categories.map(({categoryId}) => categoryId)
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