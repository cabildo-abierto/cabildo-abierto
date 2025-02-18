export function getTopicTitle(topic: {id: string, versions: {title?: string}[]}){
    let title = topic.id
    topic.versions.forEach(({title: newTitle}) => {
        if(newTitle){
            title = newTitle
        }
    })
    return title
}


export function getCurrentContentVersion(topic: {versions: {content?: {text?: string, numWords?: number}}[]}, version?: number){
    if(!version) version = topic.versions.length-1
    let lastContent = 0
    for(let i = 0; i <= version; i++){
        if(topic.versions[i].content.text || topic.versions[i].content.numWords != undefined){
            lastContent = i
        }
    }
    return lastContent
}