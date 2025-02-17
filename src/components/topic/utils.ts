export function getTopicTitle(topic: {id: string, versions: {title?: string}[]}){
    let title = topic.id
    topic.versions.forEach(({title: newTitle}) => {
        if(newTitle){
            title = newTitle
        }
    })
    return title
}


export function getCurrentContentVersion(topic: {versions: {content?: {text?: string}}[]}, version: number){
    let lastContent = 0
    for(let i = 0; i <= version; i++){
        if(topic.versions[i].content.text){
            lastContent = i
        }
    }
    return lastContent
}