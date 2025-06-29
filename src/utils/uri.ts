import {WikiEditorState} from "@/components/topics/topic/topic-content-expanded-view-header";

export const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL!

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
        return "ar.com.cabildoabierto.article"
    }
    if (collection == "post") {
        return "app.bsky.feed.post"
    }
    if (collection == "visualization") {
        return "ar.com.cabildoabierto.visualization"
    }
    return collection
}

export function collectionToShortCollection(collection: string) {
    if (collection == "ar.com.cabildoabierto.article") {
        return "article"
    }
    if (collection == "app.bsky.feed.post") {
        return "post"
    }
    if (collection == "ar.com.cabildoabierto.visualization") {
        return "visualization"
    }
    return collection
}

export function expandURI(uri: string){
    if(!uri.startsWith("at://")){
        uri = "at://" + uri
    }
    const {did, collection, rkey} = splitUri(uri)

    return getUri(did, shortCollectionToCollection(collection), rkey)
}

export function editVisualizationUrl(uri: string) {
    const {did, rkey, collection} = splitUri(uri)
    const collectionParam = collection != "ar.com.cabildoabierto.visualization" ? "&c=" + collection : ""
    return "/nueva-visualizacion?did=" + did + "&rkey=" + rkey + collectionParam
}

export function profileUrl(handleOrDid: string) {
    return "/perfil/" + handleOrDid
}

export function contentUrl(uri: string) {
    const {did, collection, rkey} = splitUri(uri)

    if(isTopicVersion(collection)){
        return topicUrl(undefined, {did, rkey}, undefined)
    }

    return "/c/" + did + "/" + collectionToShortCollection(collection) + "/" + rkey
}

export function chatUrl(convoId: string) {
    return `/mensajes/${convoId}`
}

export function topicUrl(title?: string, version?: {did: string, rkey: string}, s?: WikiEditorState, base: string = "tema") {
    const params: string[] = []

    if(title) {
        params.push(`i=${encodeURIComponent(title)}`)
    }
    if(version) {
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

export function urlFromRecord(uri: string) {
    const {did, collection, rkey} = splitUri(uri)
    if (collection == "ar.com.cabildoabierto.visualization") {
        return "/c/" + did + "/" + collection + "/" + rkey
    } else if (collection == "ar.com.cabildoabierto.dataset") {
        return "/c/" + did + "/" + collection + "/" + rkey
    }
    return contentUrl(uri)
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

export function collectionToDisplay(c: string, article: ArticleKind = "none"){
    const masc = isArticle(c) || isDataset(c)
    let artStr: string
    if(article == "none") artStr = ""
    else if(article == "author") artStr = "tu "
    else if(article == "not-author") artStr = masc ? "un" : "una "

    if(isPost(c)){
        return artStr + "Publicación"
    } else if (isArticle(c)){
        return artStr + "Artículo"
    } else if (isTopicVersion(c)){
        return artStr + "Tema"
    } else if (isDataset(c)){
        return artStr + "Conjunto de datos"
    } else if (isVisualization(c)){
        return artStr + "Visualización"
    }
}


export const urlCongreso = "/temas/congreso"