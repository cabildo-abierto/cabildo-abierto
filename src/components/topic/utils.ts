export function getTopicTitle(topic: {id: string, versions: {title?: string}[]}){
    let title = topic.id
    topic.versions.forEach(({title: newTitle}) => {
        if(newTitle){
            title = newTitle
        }
    })
    return title
}