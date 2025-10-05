import {WikiEditorState} from "@/lib/types";

export const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://0.0.0.0:8080"

export function getUri(did: string, collection: string, rkey: string) {
    return "at://" + did + "/" + collection + "/" + rkey
}

export function splitUri(uri: string) {
    const split = uri.split('/')
    return {
        did: split[2],
        collection: split[3],
        rkey: split[4]
    }
}

export function getDidFromUri(uri: string) {
    return uri.split("/")[2]
}

export function getRkeyFromUri(uri: string) {
    const s = uri.split("/")
    return s[s.length - 1]
}

export function shortCollectionToCollection(collection: string) {
    if (collection == "article") {
        return "ar.cabildoabierto.feed.article"
    }
    if (collection == "post") {
        return "app.bsky.feed.post"
    }
    if (collection == "visualization") {
        return "ar.cabildoabierto.data.visualization"
    }
    if (collection == "topicVersion") {
        return "ar.cabildoabierto.wiki.topicVersion"
    }
    return collection
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

export function profileUrl(handleOrDid: string) {
    return "/perfil/" + handleOrDid
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

export function topicUrl(id?: string, version?: {did: string, rkey: string}, s?: WikiEditorState, base: string = "tema") {
    const params: string[] = []

    if(id) {
        params.push(`i=${encodeParentheses(encodeURIComponent(id))}`)
    }
    if(version && version.did && version.rkey) {
        params.push(`did=${version.did}`)
        params.push(`rkey=${version.rkey}`)
    }
    if(s) {
        params.push(`s=${s}`)
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

export function getCollectionFromUri(uri: string) {
    return uri.split("/")[3]
}

export function isPost(c: string) {
    return c == "app.bsky.feed.post"
}

export function isArticle(c: string){
    return c == "ar.cabildoabierto.feed.article" || c == "ar.com.cabildoabierto.article"
}

export function isTopicVersion(c: string){
    return c == "ar.com.cabildoabierto.topic" || c == "ar.cabildoabierto.wiki.topicVersion"
}

export function isDataset(c: string){
    return c == "ar.com.cabildoabierto.dataset" || c == "ar.cabildoabierto.data.dataset"
}

export function isVisualization(c: string){
    return c == "ar.com.cabildoabierto.visualization"
}

export type ArticleKind = "none" | "author" | "not-author"

export function collectionToDisplay(c: string, article: ArticleKind = "none", topicId?: string){
    const masc = isArticle(c) || isDataset(c)
    let artStr: string
    if(article == "none") artStr = ""
    else if(article == "author") artStr = "tu "
    else if(article == "not-author") artStr = masc ? "un" : "una "

    if(isPost(c)){
        return artStr + (artStr ? "publicación" : "Publicación")
    } else if (isArticle(c)){
        return artStr + (artStr ? "artículo" : "Artículo")
    } else if (isTopicVersion(c)){
        return artStr + `versión ${topicId ? `del tema ${topicId}` : "de un tema"}`
    } else if (isDataset(c)){
        return artStr + (artStr ? "conjunto de datos" : "Conjunto de datos")
    } else if (isVisualization(c)){
        return artStr + (artStr ? "visualización" : "Visualización")
    }
}


export function encodeParentheses(s: string){
    return s.replaceAll("(", "%28").replaceAll(")", "%29")
}