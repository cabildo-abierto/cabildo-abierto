import {db} from "@/db"
import {getDidFromUri, getRkeyFromUri} from "@/utils/uri";


export function createRecord({uri, cid, createdAt, collection}: {
    uri: string
    cid: string
    createdAt: Date
    collection: string
}){
    const data = {
        uri,
        cid,
        rkey: getRkeyFromUri(uri),
        createdAt: new Date(createdAt),
        authorId: getDidFromUri(uri),
        collection: collection
    }

    let updates: any[] = [db.record.upsert({
        create: data,
        update: data,
        where: {
            uri: uri
        }
    })]
    return updates
}
