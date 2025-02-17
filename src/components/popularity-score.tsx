import {FeedContentProps} from "../app/lib/definitions";

export function popularityScore(content: FeedContentProps){
    if(content.participantsCount == undefined || content.uniqueViewsCount == undefined){
        return [0]
    }

    const participants = content.participantsCount

    const viewWeight = content.collection == "app.bsky.feed.post" ? 0.4 : 1

    const views = content.uniqueViewsCount

    //const daysSinceCreation = (new Date().getTime() - new Date(content.createdAt).getTime()) / (1000*60*60*24)


    return [participants / Math.max(views * viewWeight, 1), participants, views]
}

/*function isPopularEnough(content: {childrenTree: {authorId: string}[], author: {id: string}, _count: {reactions: number}}){
    const commentators = new Set(content.childrenTree.map(({authorId}) => (authorId)))
    commentators.delete(content.author.id)

    return content._count.reactions + commentators.size > 0
}*/