import {FeedMerger} from "@/components/feed/feed/types";
import {unique} from "@cabildo-abierto/utils";
import {FeedViewContent} from "@cabildo-abierto/api/dist/client/types/ar/cabildoabierto/feed/defs";
import { ArCabildoabiertoFeedDefs } from "@cabildo-abierto/api";


export function defaultFeedMerger<T>(acc: T[], newElements: T[]) {
    return unique([...acc, ...newElements])
}


function getFeedViewContentCreationDate(content: FeedViewContent): Date {
    if(ArCabildoabiertoFeedDefs.isReasonRepost(content.reason)) {
        return new Date(content.reason.indexedAt)
    } else {
        if(ArCabildoabiertoFeedDefs.isPostView(content.content) || ArCabildoabiertoFeedDefs.isArticleView(content.content)) {
            return new Date(content.content.indexedAt)
        }
        return null
    }
}


function getFeedViewContentRootUri(content: FeedViewContent): string {
    if(ArCabildoabiertoFeedDefs.isReasonRepost(content.reason)) {
        if(ArCabildoabiertoFeedDefs.isPostView(content.content) || ArCabildoabiertoFeedDefs.isArticleView(content.content)) {
            return content.content.uri
        }
        return null
    } else {
        if(content.reply) {
            if(ArCabildoabiertoFeedDefs.isPostView(content.reply.root)) {
                return content.reply.root.uri
            }
        } else if(ArCabildoabiertoFeedDefs.isPostView(content.content) || ArCabildoabiertoFeedDefs.isArticleView(content.content)) {
            return content.content.uri
        }
        return null
    }
}



export const chronologicalFeedMerger: FeedMerger<FeedViewContent> = (acc, newElements) => {
    // 1. Filtro los que no tienen fecha
    // 2. Ordeno según fecha
    // 3. Agrego solo los elementos cuyo root no haya aparecido todavía, donde root en caso de un repost es el contenido reposteado.

    function cmp(a: FeedViewContent, b: FeedViewContent) {
        return getFeedViewContentCreationDate(b).getTime() - getFeedViewContentCreationDate(a).getTime()
    }

    const filtered = newElements
        .filter(a => getFeedViewContentCreationDate(a) != null)

    const sorted = filtered.toSorted(cmp)

    const res = [...acc]

    const present = new Set(acc.map(getFeedViewContentRootUri))
    sorted.forEach(e => {
        const rootUri = getFeedViewContentRootUri(e)
        if(!rootUri) return
        if(!present.has(rootUri)) {
            res.push(e)
            present.add(rootUri)
        }
    })
    return res
}


export const repliesFeedMerger: FeedMerger<FeedViewContent> = (acc, newElements) => {
    // Es similar al chronologicalFeedMerger, pero el se mantienen todas las respuestas (salvo que estén repetidas)
    // Si aparece una respuesta con un root que ya apareció se la procesa para que solo sea visible la respuesta

    function cmp(a: FeedViewContent, b: FeedViewContent) {
        return getFeedViewContentCreationDate(b).getTime() - getFeedViewContentCreationDate(a).getTime()
    }

    const filtered = newElements
        .filter(a => getFeedViewContentCreationDate(a) != null)

    const sorted = filtered.toSorted(cmp)

    const res = [...acc]

    const present = new Set(acc.map(getFeedViewContentRootUri))
    sorted.forEach(e => {
        const rootUri = getFeedViewContentRootUri(e)
        if(!rootUri) return
        if(!present.has(rootUri)) {
            res.push(e)
            present.add(rootUri)
        } else {
            if(e.reply) {
                res.push({
                    ...e,
                    reply: {
                        ...e.reply,
                        root: undefined // al mantener solo el parent y no el root, el renderizador muestra solamente el usuario al que se responde
                    }
                })
            }
        }
    })
    return res
}