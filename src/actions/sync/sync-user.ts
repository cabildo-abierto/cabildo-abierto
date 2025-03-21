"use server"
import {db} from "../../db";
import {UserRepo} from "../../app/lib/definitions";
import {processCreateRecord} from "./process-event";
import {getServiceEndpointForDid} from "../blob";
import {deleteRecords} from "../admin";
import {iterateAtpRepo} from "@atcute/car"
import {revalidateTag} from "next/cache";
import {validRecord} from "./utils";
import {getDirtyUsers, setMirrorStatus} from "./mirror-status";


export async function restartSync(){
    await db.user.updateMany({
        data: {
            mirrorStatus: "Dirty"
        }
    })
    revalidateTag("user")
}


export async function syncAllUsers() {
    const users = await getDirtyUsers()

    for(let i = 0; i < users.length; i++) {
        await syncUser(users[i])
    }
}


function parseCar(did: string, buf: ArrayBuffer): UserRepo {
    const ui8 = new Uint8Array(buf);
    const repo = []
    for (const { collection, rkey, record, cid } of iterateAtpRepo(ui8)){
        const uri = "at://" + did + "/" + collection + "/" + rkey
        repo.push({did, collection, rkey, record, cid: cid.$link, uri: uri})
    }
    return repo
}


export async function syncUser(did: string){
    console.log("Syncing user:", did)

    const [_, doc] = await Promise.all([
        db.user.update({
            data: {
                mirrorStatus: "InProcess"
            },
            where: {
                did: did
            }
        }),
        getServiceEndpointForDid(did)
    ])

    const presentRecords = new Set()
    let foundRepo = false
    if(typeof doc == "string"){
        const url = doc+"/xrpc/com.atproto.sync.getRepo?did="+did
        const res = await fetch(url)
        if(res.ok){
            foundRepo = true
            const arrayBuffer = await res.arrayBuffer()
            let repo = parseCar(did, arrayBuffer)

            repo = repo.filter((r) => (validRecord(r)))
            repo.forEach((r) => {presentRecords.add(r.uri)})

            await processRepo(repo, did)
        }
    }

    if(!foundRepo){
        console.log("Couldn't fetch repo from " + did)
        await db.user.update({
            data: {
                mirrorStatus: "Failed"
            },
            where: {
                did: did
            }
        })
        return
    }

    /*
    TO DO: Procesar eventos pendientes
    while(!state.pending.isEmpty()){
        const e = state.pending.shift()
        if(!e) break
        await processEvent(e)
        if(e.kind == "commit"){
            presentRecords.add((e as CommitEvent).commit.uri)
        }
    }*/

    const records = await db.record.findMany({
        select: {
            uri: true,
        },
        where: {
            authorId: did
        }
    })

    const uris: string[] = records.map(({uri}) => uri).filter(uri => !presentRecords.has(uri))

    await deleteRecords({uris, atproto: false})

    await setMirrorStatus(did, "Sync")
    console.log("Marking", did, "as sync")
}


export async function processRepo(repo: UserRepo, did: string){
    const {reqUpdate, recordsReqUpdate} = await checkUpdateRequired(repo, did)
    if(!reqUpdate){
        console.log("update for", did, "was not required")
        return
    }

    if(reqUpdate){
        console.log("algo raro pasó", did, "requiere update")
    }

    let updates: any[] = []
    for(let i = 0; i < repo.length; i++){
        if(recordsReqUpdate == null || recordsReqUpdate.has(repo[i].uri)){
            updates = [...updates, ...await processCreateRecord(repo[i])]
        }
    }
    const t1 = Date.now()
    const batchSize = 500
    const retries = 100
    let updateOk = false
    console.log("Total updates", updates.length)
    for(let i = 0; i < updates.length; i += batchSize){
        console.log("starting batch in index", i, "of", updates.length)
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                await db.$transaction(updates.slice(i, i+batchSize))
                updateOk = true
                break
            } catch (error) {
                console.warn("Error actualizando " + did + ", batch " + i + ". Retrying attempt "+attempt+"...")
                console.log(error)
                await new Promise(res => setTimeout(res, 100 * attempt));
            }
        }
    }
    if(updateOk){
        console.log("Updating", did, "finished after", Date.now() - t1)
    } else {
        console.log("Couldn't update", did)
    }
}


export async function checkUpdateRequired(repo: UserRepo, did: string){
    const records = await db.record.findMany({
        select: {
            uri: true,
            cid: true,
        },
        where: {
            authorId: did
        }
    })

    const recordsReqUpdate = new Set<string>()
    let reqUpdate = false

    const repoCids: Map<string, string> = new Map()
    for(let i = 0; i < repo.length; i++){
        repoCids.set(repo[i].uri, repo[i].cid)
    }

    const dbCids: Map<string, string | null> = new Map()
    for(let i = 0; i < records.length; i++){
        dbCids.set(records[i].uri, records[i].cid)
        if(!repoCids.has(records[i].uri) || repoCids.get(records[i].uri) != records[i].cid){
            reqUpdate = true
        }
    }

    for(let i = 0; i < repo.length; i++){

        if(!dbCids.has(repo[i].uri) || dbCids.get(repo[i].uri) != repo[i].cid){
            reqUpdate = true
            recordsReqUpdate.add(repo[i].uri)
        }
    }

    return {reqUpdate, recordsReqUpdate}
}