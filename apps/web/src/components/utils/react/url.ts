import {
    encodeParentheses,
    isArticle,
    isDataset,
    isPost,
    isTopicVersion,
    isVisualization,
    splitUri
} from "@cabildo-abierto/utils"

export type ProfileFeedOption = "publicaciones" | "respuestas" | "ediciones" | "articulos"

export function profileUrl(handleOrDid: string, selected?: ProfileFeedOption) {
    return "/perfil/" + handleOrDid + (selected ? `?s=${selected}` : "")
}


// TO DO: Usar el handle, pero arreglar las queries...
export function contentUrl(uri: string, handle?: string) {
    const {did, collection, rkey} = splitUri(uri)

    if(isTopicVersion(collection)){
        return topicUrl(undefined, {did, rkey}, undefined)
    }

    return "/c/" + did + "/" + collectionToShortCollection(collection) + "/" + rkey
}

export function chatUrl(convoId: string) {
    return `/mensajes/${convoId}`
}

export function topicMentionsUrl(id: string) {
    return `/tema/menciones?i=${encodeParentheses(encodeURIComponent(id))}`
}

export function topicUrl(id?: string, version?: {did: string, rkey: string}, editing?: boolean, base: string = "tema") {
    const params: string[] = []

    if(id) {
        params.push(`i=${encodeParentheses(encodeURIComponent(id))}`)
    }
    if(version && version.did && version.rkey) {
        params.push(`did=${version.did}`)
        params.push(`rkey=${version.rkey}`)
    }
    if(editing) {
        params.push("edit=true")
    }

    if(params.length == 0){
        throw Error("Parámetros insuficientes.")
    }

    return `/${base}?` + params.join("&")
}

export function bskyProfileUrl(handle: string){
    return "https://bsky.app/profile/" + handle
}


export function getBlueskyUrl(uri: string) {
    const {did, rkey} = splitUri(uri)
    return "https://bsky.app/profile/" + did + "/post/" + rkey
}

export function categoryUrl(cat: string, view: string) {
    return "/temas?c=" + cat + "&view=" + view
}

export function threadApiUrl(uri: string) {
    const {did, collection, rkey} = splitUri(uri)
    return "/thread/" + did + "/" + collection + "/" + rkey
}



export function collectionToShortCollection(collection: string) {
    if (isPost(collection)) {
        return "post"
    }
    if(isArticle(collection)){
        return "article"
    }
    if(isDataset(collection)){
        return "dataset"
    }
    return collection
}


