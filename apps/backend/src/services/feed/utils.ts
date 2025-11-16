import {ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api"
import {isKnownContent} from "#/utils/type-utils.js";


function getRootCreationDate(p: ArCabildoabiertoFeedDefs.FeedViewContent): Date | null {
    if(p.reason && "indexedAt" in p.reason){
        return new Date(p.reason.indexedAt)
    } else if(ArCabildoabiertoFeedDefs.isPostView(p.content)){
        if(p.reply && p.reply.root && "indexedAt" in p.reply.root){
            return new Date(p.reply.root.indexedAt)
        } else if(p.reply && p.reply.parent && "indexedAt" in p.reply.parent){
            return new Date(p.reply.parent.indexedAt)
        }
    }
    if("indexedAt" in p.content){
        return new Date(p.content.indexedAt)
    }
    return null
}


export const creationDateSortKey = (a: ArCabildoabiertoFeedDefs.ThreadViewContent | ArCabildoabiertoFeedDefs.FeedViewContent) => {
    return isKnownContent(a.content) ? [new Date(a.content.indexedAt).getTime()] : [0]
}


export const rootCreationDateSortKey = (a: ArCabildoabiertoFeedDefs.FeedViewContent) => {
    const date = getRootCreationDate(a)
    return date ? [date.getTime()] : [0]
}
