"use server"

import {ATProtoStrongRef, CommitEvent, JetstreamEvent, SyncRecordProps} from "../../app/lib/definitions";
import {db} from "../../db";
import {DidResolver} from "@atproto/identity";
import {syncUser} from "./sync-user";
import {validRecord} from "./utils";
import {getUserMirrorStatus} from "./mirror-status";
import {
    newUser,
    processArticle,
    processDataBlock,
    processDataset,
    processFollow,
    processLike,
    processPost, processRecord,
    processRepost,
    processTopic,
    processVisualization
} from "./record-processing";
import {splitUri, threadApiUrl} from "../../components/utils/uri";
import {revalidateTags} from "../admin";


export async function processEvent(e: JetstreamEvent){
    const status = await getUserMirrorStatus(e.did)

    if(e.kind == "commit"){
        const c = e as CommitEvent

        if(c.commit.collection == "ar.com.cabildoabierto.profile" && c.commit.rkey == "self"){
            await newUser(e.did, true)
            await syncUser(e.did)
            return
        }
    }

    if(status == "Dirty") {
        await syncUser(e.did)
        await processEvent(e)
    } else if(status == "Sync"){
        if(e.kind == "commit"){
            const c = e as CommitEvent

            const uri = c.commit.uri ? c.commit.uri : "at://" + c.did + "/" + c.commit.collection + "/" + c.commit.rkey
            if(c.commit.operation == "create"){
                const record = {
                    did: c.did,
                    uri: uri,
                    cid: c.commit.cid,
                    collection: c.commit.collection,
                    rkey: c.commit.rkey,
                    record: c.commit.record
                }

                if(!validRecord(record)){
                    console.log("Invalid record")
                    console.log(record)
                    return
                }

                const {updates, tags} = await processCreateRecord(record)
                await db.$transaction(updates)
                await revalidateTags(Array.from(tags))
            } else if(c.commit.operation == "delete"){
                await processDelete({
                    did: c.did,
                    collection: c.commit.collection,
                    rkey: c.commit.rkey
                })
            }
        }
    } else if(status == "InProcess"){
        console.error(e.did, "got an event while updating")
    }
}


export async function processCreateRecordFromRefAndRecord(ref: ATProtoStrongRef, record: any){
    return await processCreateRecord({
        ...ref,
        ...splitUri(ref.uri),
        record
    })
}


export async function processCreateRecord(r: SyncRecordProps): Promise<{updates: any[], tags: Set<string>}> {
    console.log("processing create record", r)
    try {
        let updates: any[] = processRecord(r)
        let tags: Set<string> = new Set()
        if(r.collection == "app.bsky.graph.follow"){
            updates = [...updates, ...processFollow(r)]
            tags.add("user:"+r.record.subject)
        } else if(r.collection == "app.bsky.feed.like"){
            updates = [...updates, ...processLike(r)]
            tags.add("feedCA")
            tags.add(threadApiUrl(r.record.subject.uri))
        } else if(r.collection == "app.bsky.feed.repost"){
            updates = [...updates, ...processRepost(r)]
            tags.add("feedCA")
            tags.add(threadApiUrl(r.record.subject.uri))
        } else if(r.collection == "app.bsky.feed.post") {
            updates = [...updates, ...processPost(r)]
            tags.add("feedCA")
        } else if(r.collection == "ar.com.cabildoabierto.quotePost"){
            updates = [...updates, ...processPost(r)]
            tags.add("feedCA")
        } else if(r.collection == "ar.com.cabildoabierto.article"){
            updates = [...updates, ...processArticle(r)]
            tags.add("feedCA")
        } else if(r.collection == "ar.com.cabildoabierto.topic") {
            updates = [...updates, ...processTopic(r)]
            tags.add("topics") // solo hace falta si es un nuevo tema o cambian las categorías
        } else if(r.collection == "ar.com.cabildoabierto.profile"){
            updates = [...updates, ...processCAProfile(r)]
            tags.add("user:"+r.did)
        } else if(r.collection == "app.bsky.actor.profile"){
            updates = [...updates, ...await processATProfile(r)]
            tags.add("user:"+r.did)
        } else if(r.collection == "ar.com.cabildoabierto.dataset"){
            updates = [...updates, ...processDataset(r)]
            tags.add("datasets")
        } else if(r.collection == "ar.com.cabildoabierto.dataBlock"){
            updates = [...updates, ...processDataBlock(r)]
            tags.add("datasets")
        } else if(r.collection == "ar.com.cabildoabierto.visualization"){
            updates = [...updates, ...processVisualization(r)]
            tags.add("visualization")
        }
        return {updates, tags}
    } catch (err) {
        console.log("Error processing record", r)
        console.log(err)
        return {updates: [], tags: new Set<string>()}
    }
}


function avatarUrl(did: string, cid: string){
    return "https://cdn.bsky.app/img/avatar/plain/"+did+"/"+cid+"@jpeg"
}

function bannerUrl(did: string, cid: string) {
    return "https://cdn.bsky.app/img/banner/plain/"+did+"/"+cid+"@jpeg"
}


function processCAProfile(r: SyncRecordProps){
    return [
        db.user.update({
            data: {
                CAProfileUri: r.uri,
                inCA: true
            },
            where: {
                did: r.did
            }
        })
    ]
}


export async function processATProfile(r: SyncRecordProps){
    const avatarCid = r.record.avatar ? r.record.avatar.ref.$link : undefined
    const avatar = avatarCid ? avatarUrl(r.did, avatarCid) : undefined
    const bannerCid = r.record.banner ? r.record.banner.ref.$link : undefined
    const banner = bannerCid ? bannerUrl(r.did, bannerCid) : undefined

    const didres = new DidResolver({})
    const data = await didres.resolveAtprotoData(r.did)

    return [
        db.user.update({
            data: {
                description: r.record.description ? r.record.description : undefined,
                displayName: r.record.displayName ? r.record.displayName : undefined,
                avatar,
                banner,
                handle: data.handle
            },
            where: {
                did: r.did
            }
        })
    ]
}



export async function processDelete(r: {did: string, collection: string, rkey: string}){
    if(r.collection == "app.bsky.feed.like" || r.collection == "app.bsky.feed.repost"){
        const deleteLikes = db.like.deleteMany({
            where: {
                record: {
                    rkey: r.rkey,
                    authorId: r.did
                }
            }
        })
        const deleteReposts = db.repost.deleteMany({
            where: {
                record: {
                    rkey: r.rkey,
                    authorId: r.did
                }
            }
        })
        const deleteRecords = db.record.deleteMany({
            where: {
                rkey: r.rkey,
                authorId: r.did
            }
        })

        await db.$transaction([deleteLikes, deleteReposts, deleteRecords])
    }
}