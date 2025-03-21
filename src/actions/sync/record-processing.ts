import {SyncRecordProps} from "../../app/lib/definitions";
import {db} from "../../db";
import {getAllText} from "../../components/topic/diff";
import {decompress} from "../../components/utils/compression";
import {getCollectionFromUri, getDidFromUri, getRkeyFromUri} from "../../components/utils/uri";
import {setTopicCategories} from "../topic/utils";


export function processRecord(r: SyncRecordProps) {
    const data = {
        uri: r.uri,
        cid: r.cid,
        rkey: r.rkey,
        createdAt: new Date(r.record.createdAt),
        authorId: r.did,
        collection: r.collection
    }
    return [db.record.upsert({
        create: data,
        update: data,
        where: {
            uri: r.uri
        }
    })]
}


export function newUser(did: string, inCA: boolean){
    if(inCA){
        return db.user.upsert({
            create: {
                did: did,
                inCA: true
            },
            update: {
                inCA: true
            },
            where: {
                did: did
            }
        })
    } else {
        return db.user.upsert({
            create: {did},
            update: {did},
            where: {did}
        })
    }
}

export function newDirtyRecord(link: {uri: string, cid?: string}){
    const {uri, cid} = link
    const did = getDidFromUri(uri)
    const updates: any[] = [newUser(did, false)]
    const data = {
        uri: uri,
        cid: cid,
        authorId: did,
        rkey: getRkeyFromUri(uri),
        collection: getCollectionFromUri(uri)
    }
    if(!uri) console.log("dirty record uri", uri, link)
    updates.push(db.record.upsert({
        create: data,
        update: data,
        where: {
            uri: uri
        }
    }))
    return updates
}


export function processFollow(r: SyncRecordProps){
    const updates: any[] = [newUser(r.record.subject, false)]
    const follow = {
        uri: r.uri,
        userFollowedId: r.record.subject
    }
    updates.push(db.follow.upsert({
        create: follow,
        update: follow,
        where: {
            uri: r.uri
        }
    }))
    return updates
}


export function processLike(r: SyncRecordProps){
    const updates: any[] = newDirtyRecord(r.record.subject)

    const like = {
        uri: r.uri,
        likedRecordId: r.record.subject.uri
    }
    updates.push(db.like.upsert({
        create: like,
        update: like,
        where: {
            uri: r.uri
        }
    }))

    return updates
}


export function processRepost(r: SyncRecordProps){
    const updates: any[] = newDirtyRecord(r.record.subject)
    const repost = {
        uri: r.uri,
        repostedRecordId: r.record.subject.uri
    }

    updates.push(db.repost.upsert({
        create: repost,
        update: repost,
        where: {
            uri: r.uri
        }
    }))

    return updates
}

export function processContent(r: SyncRecordProps){
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
            let blobCid: string = r.record.text.ref.toString()
            if(blobCid == "[object Object]"){
                blobCid = r.record.text.ref.$link
            }
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
        text: text,
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

export function processPost(r: SyncRecordProps){
    let updates: any[] = []
    if(r.record.reply){
        updates = [...updates, ...newDirtyRecord(r.record.reply.parent)]
        if(r.record.reply.root){
            updates = [...updates, ...newDirtyRecord(r.record.reply.root)]
        }
    }

    updates = [...updates, ...processContent(r)]

    const post = {
        facets: r.record.facets ? JSON.stringify(r.record.facets) : null,
        embed: r.record.embed ? JSON.stringify(r.record.embed) : null,
        uri: r.uri,
        replyToId: r.record.reply ? r.record.reply.parent.uri as string : null,
        rootId: r.record.reply && r.record.reply.root ? r.record.reply.root.uri : null,
        quote: r.record.quote ? r.record.quote : null
    }

    updates.push(db.post.upsert({
        create: post,
        update: post,
        where: {
            uri: r.uri
        }
    }))

    return updates
}

export function processArticle(r: SyncRecordProps){
    const updates: any[] = processContent(r)

    const article = {
        uri: r.uri,
        title: r.record.title
    }

    updates.push(db.article.upsert({
        create: article,
        update: article,
        where: {
            uri: r.uri
        }
    }))

    return updates
}

export function processTopic(r: SyncRecordProps) {
    let updates: any[] = processContent(r)

    const record = r.record as {
        id: string
        title?: string
        message?: string
        synonyms?: string
        categories?: string
        format?: string
    }

    const isNewCurrentVersion = r.record.text != null

    const topic = {
        id: record.id,
        synonyms: isNewCurrentVersion && record.synonyms ? JSON.parse(record.synonyms) : undefined
    }

    updates.push(db.topic.upsert({
        create: topic,
        update: topic,
        where: {id: record.id}
    }))

    if(isNewCurrentVersion && record.categories){
        updates = [
            ...updates,
            ...setTopicCategories(record.id, JSON.parse(record.categories))
        ]
    }

    const topicVersion = {
        uri: r.uri,
        topicId: record.id,
        title: record.title ? record.title : undefined,
        message: record.message ? record.message : undefined,
        synonyms: record.synonyms ? record.synonyms : undefined,
        categories: record.categories ? record.categories : undefined,
    }

    updates.push(db.topicVersion.upsert({
        create: topicVersion,
        update: topicVersion,
        where: {
            uri: r.uri
        }
    }))

    if(isNewCurrentVersion){
        updates.push(
            db.topic.update({
                data: {
                    currentVersionId: r.uri
                },
                where: {
                    id: record.id
                }
            })
        )
    }

    return updates
}


export function processDataset(r: SyncRecordProps){
    const dataset = {
        uri: r.uri,
        columns: r.record.columns.map(({name}: {name: string}) => (name)),
        title: r.record.title,
        description: r.record.description ? r.record.description : undefined
    }
    return [
        db.dataset.upsert({
            create: dataset,
            update: dataset,
            where: {uri: r.uri}
        })
    ]
}

export function processDataBlock(r: SyncRecordProps){
    const blobCid: string = r.record.data.ref.$link
    const blobDid = r.did // los blobs siempre se almacenan en el mismo repo
    const blob = {
        cid: blobCid,
        authorId: blobDid
    }
    const block = {
        uri: r.uri,
        datasetId: r.record.dataset.uri as string,
        format: r.record.format as string,
        blobId: blobCid
    }
    const dirtyDataset = {
        columns: [], // un dataset sin columnas es inválido, lo usamos como placeholder
        title: "",
        uri: r.record.dataset.uri
    }
    return [
        ...newDirtyRecord(r.record.dataset),
        db.dataset.upsert({
            create: dirtyDataset,
            update: {},
            where: {uri: r.record.dataset.uri}
        }),
        db.blob.upsert({
            create: blob,
            update: blob,
            where: {cid: blobCid}
        }),
        db.dataBlock.upsert({
            create: block,
            update: block,
            where: {uri: r.uri}
        })
    ]
}

export function processVisualization(r: SyncRecordProps){
    const spec = JSON.parse(r.record.spec)

    const datasetUri: string | null = spec.metadata && spec.metadata.editorConfig ? spec.metadata.editorConfig.datasetUri : null

    let updates = []
    if(datasetUri){
        updates = newDirtyRecord({uri: datasetUri})
    }

    const blobCid: string = r.record.preview.ref.$link
    const blobDid = r.did
    const blob = {
        cid: blobCid,
        authorId: blobDid
    }

    const visualization = {
        uri: r.uri,
        spec: r.record.spec,
        datasetId: datasetUri,
        previewBlobCid: blobCid
    }

    return [
        ...updates,
        db.blob.upsert({
            create: blob,
            update: blob,
            where: {cid: blobCid}
        }),
        db.visualization.upsert({
            create: visualization,
            update: visualization,
            where: {uri: r.uri}
        })
    ]
}
