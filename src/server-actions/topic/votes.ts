"use server"


import {getSessionAgent, getSessionDid} from "../auth";
import {deleteRecords, revalidateTags} from "../admin";
import {processCreateRecord} from "../sync/process-event";
import {getCollectionFromUri, getRkeyFromUri} from "@/utils/uri";
import {ATProtoStrongRef} from "@/lib/definitions";
import {db} from "@/db";
import {updateTopicCurrentVersion} from "./current-version";

export async function acceptEdit(topicId: string, versionRef: ATProtoStrongRef): Promise<{error?: string}>{
    const did = await getSessionDid()

    const [rejects, _] = await Promise.all([
        db.topicReject.findMany({
            select: {
                uri: true
            },
            where: {
                rejectedRecordId: versionRef.uri,
                record: {
                    authorId: did
                }
            }
        }),
        createTopicVote(topicId, versionRef, "accept")
    ])

    if(rejects.length > 0){
        await deleteRecords({uris: rejects.map(a => a.uri), atproto: true})
    }

    await updateTopicCurrentVersion(topicId)

    return {}
}

export async function createTopicVote(topicId: string, versionRef: ATProtoStrongRef, value: string): Promise<{error?: string}>{
    const {agent, did} = await getSessionAgent()

    const record = {
        $type: "ar.com.cabildoabierto.topic.vote",
        createdAt: new Date().toISOString(),
        value,
        subject: versionRef
    }

    const {data} = await agent.com.atproto.repo.createRecord({
        record,
        collection: "ar.com.cabildoabierto.topic.vote",
        repo: did
    })

    let {updates, tags} = await processCreateRecord({
        did,
        uri: data.uri,
        cid: data.cid,
        rkey: getRkeyFromUri(data.uri),
        collection: getCollectionFromUri(data.uri),
        record
    })

    await db.$transaction(updates)
    await revalidateTags(Array.from(tags))

    return {}
}

export async function cancelAcceptEdit(topicId: string, uri: string): Promise<{error?: string}>{
    return await deleteRecords({uris: [uri], atproto: true})
}

export async function rejectEdit(topicId: string, versionRef: ATProtoStrongRef): Promise<{error?: string}>{
    const did = await getSessionDid()

    const [accepts, _] = await Promise.all([
        db.topicAccept.findMany({
            select: {
                uri: true
            },
            where: {
                acceptedRecordId: versionRef.uri,
                record: {
                    authorId: did
                }
            }
        }),
        createTopicVote(topicId, versionRef, "reject")
    ])

    if(accepts.length > 0){
        await deleteRecords({uris: accepts.map(a => a.uri), atproto: true})
    }

    await updateTopicCurrentVersion(topicId)

    return {}
}

export async function cancelRejectEdit(topicId: string, uri: string): Promise<{error?: string}>{
    return await deleteRecords({uris: [uri], atproto: true})
}

