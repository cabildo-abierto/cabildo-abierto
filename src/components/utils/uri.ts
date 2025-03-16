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