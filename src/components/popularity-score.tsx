import { ContentType } from "@prisma/client"

type ScorableContent = {
    childrenTree: {authorId: string}[]
    author: {id: string}
    type: ContentType
    reactions: {userById: string}[]
    uniqueViewsCount: number
}


const infoPopular = <div><p className="font-bold">Publicaciones ordenadas por popularidad</p>Se suman los votos hacia arriba y la cantidad de personas que comentaron y se lo divide por la cantidad de vistas.</div>


export function popularityScore(content: ScorableContent){
    const participants = new Set([
        ...content.childrenTree.map(({authorId}) => (authorId)),
        ...content.reactions.map(({userById}) => (userById))
    ])
    participants.delete(content.author.id)

    const viewWeight = content.type == "FastPost" ? 0.4 : 1

    //const daysSinceCreation = (new Date().getTime() - new Date(content.createdAt).getTime()) / (1000*60*60*24)

    return [(participants.size) / Math.max(content.uniqueViewsCount * viewWeight, 1), participants.size, content.uniqueViewsCount]
}
    
function isPopularEnough(content: {childrenTree: {authorId: string}[], author: {id: string}, _count: {reactions: number}}){
    const commentators = new Set(content.childrenTree.map(({authorId}) => (authorId)))
    commentators.delete(content.author.id)
    
    return content._count.reactions + commentators.size > 0
}