
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


export function encodeParentheses(s: string){
    return s.replaceAll("(", "%28").replaceAll(")", "%29")
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

export function profileUrl(id: string) {
    return "/perfil/" + id
}

export function contentUrl(uri: string) {
    const {did, collection, rkey} = splitUri(uri)

    return "/c/" + did + "/" + collectionToShortCollection(collection) + "/" + rkey
}

export function urlFromRecord(record: { uri: string, collection: string, author: { did: string, handle?: string } }) {
    if (record.collection == "ar.com.cabildoabierto.visualization") {
        return "/c/" + record.author.did + "/" + record.collection + "/" + getRkeyFromUri(record.uri)
    } else if (record.collection == "ar.com.cabildoabierto.dataset") {
        return "/c/" + record.author.did + "/" + record.collection + "/" + getRkeyFromUri(record.uri)
    }
    return contentUrl(record.uri)
}

export function getBlueskyUrl(uri: string) {
    const {did, rkey} = splitUri(uri)
    return "https://bsky.app/profile/" + did + "/post/" + rkey
}

export function categoryUrl(cat: string, view: string) {
    return "/temas?c=" + cat + "&view=" + view
}

export function threadApiUrl(uri: string) {
    return "/api/thread/" + getDidFromUri(uri) + "/" + getCollectionFromUri(uri) + "/" + getRkeyFromUri(uri)
}
export function isFollow(c: string){
    return c == "app.bsky.graph.follow"
}

export function isCAProfile(c: string){
    return c == "ar.com.cabildoabierto.profile" || c == "ar.cabildoabierto.actor.caProfile"
}

export function articleUris(uris: string[]){
    return uris.filter(u => isArticle(getCollectionFromUri(u)))
}

export function postUris(uris: string[]){
    return uris.filter(u => isPost(getCollectionFromUri(u)))
}

export function topicVersionUris(uris: string[]){
    return uris.filter(u => isTopicVersion(getCollectionFromUri(u)))
}


export const articleCollections = ["ar.com.cabildoabierto.article", "ar.cabildoabierto.feed.article"]