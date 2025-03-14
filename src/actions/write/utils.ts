import { getAllText } from "../../components/topic/diff"
import {getCollectionFromUri, getDidFromUri, getRkeyFromUri} from "../../components/utils/utils"
import { db } from "../../db"
import {decompress} from "../../components/utils/compression";



export function newUser(did: string, inCA: boolean){
    return [db.user.upsert({
        create: {
            did: did,
            inCA: inCA
        },
        update: {
            inCA: inCA
        },
        where: {
            did: did
        }
    })]
}



export function newDirtyRecord({cid, uri} : {cid?: string, uri: string}){
    const did = getDidFromUri(uri)
    const updates: any[] = newUser(did, false)
    const data = {
        uri: uri,
        cid: cid,
        authorId: did,
        rkey: getRkeyFromUri(uri),
        collection: getCollectionFromUri(uri)
    }
    updates.push(db.record.upsert({
        create: data,
        update: data,
        where: {
            uri: uri
        }
    }))
    return updates
}



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

export type SyncRecordProps = {
    did: string, uri: string, collection: string, rkey: string,
    cid: string,
    record: any,
    format?: string
}

export function createContent(r: SyncRecordProps & {record: {text: {ref: {$link: string}} | string}}){
    function getNumWords(text?: string){
        if(text == undefined) return undefined
        if(r.collection != "ar.com.cabildoabierto.topic" && r.collection != "ar.com.cabildoabierto.article"){
            return text.split(" ").length
        } else if(r.collection == "ar.com.cabildoabierto.article" || r.record.format == "lexical-compressed"){
            return getAllText(decompress(text)).split(" ").length
        } else {
            return text.split(" ").length
        }
    }

    let text = undefined
    let blob = undefined
    if(r.record.text){
        if(r.record.text.ref){
            const blobCid: string = r.record.text.ref.toString()
            const blobDid = r.did
            blob = {
                cid: blobCid,
                authorId: blobDid
            }
        } else {
            text = r.record.text
        }
    }

    const content = {
        text: typeof text == "string" ? text : undefined,
        textBlobId: blob ? blob.cid : undefined,
        uri: r.uri,
        numWords: getNumWords(text),
        format: r.record.format
    }

    const contentUpd = db.content.upsert({
        create: content,
        update: content,
        where: {
            uri: r.uri
        }
    })

    if(blob){
        const blobUpd = db.blob.upsert({
            create: blob,
            update: blob,
            where: {
                cid: blob.cid
            }
        })
        return [blobUpd, contentUpd]
    } else {
        return [contentUpd]
    }
}