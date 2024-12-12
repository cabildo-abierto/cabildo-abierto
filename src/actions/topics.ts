"use server"

import {getSessionAgent} from "./auth";
import {getUsers} from "./users";
import {SmallTopicProps, TopicProps} from "../app/lib/definitions";
import {db} from "../db";
import {getDidFromUri, getRkeyFromUri} from "../components/utils";
import {ContentType} from '@prisma/client'

export async function createTopic(id: string){
    return await createTopicVersion({id, claimsAuthorship: true})
}


export async function createTopicVersion({id, text = "", title, claimsAuthorship, message, createOnATProto=true}: {
    id: string, text?: string, title?: string, claimsAuthorship: boolean, message?: string, createOnATProto?: boolean}){

    const {agent, did} = await getSessionAgent()
    if(!did) return {error: "Iniciá sesión para crear un tema."}

    const record = {
        "$type": "ar.com.cabildoabierto.topic",
        text: text,
        title: title,
        format: "lexical-compressed",
        message: message,
        id: id,
        createdAt: new Date().toISOString()
    }
    try {
        const {data} = await agent.com.atproto.repo.createRecord({
            repo: did,
            collection: 'ar.com.cabildoabierto.topic',
            record: record,
        })
        await createTopicVersionCA({
            id,
            text,
            title,
            claimsAuthorship,
            uri: data.uri,
            cid: data.cid,
            message,
            did
        })
    } catch (e) {
        return {error: "Ocurrió un error al publicar en ATProto."}
    }

    return {}
}


export async function createTopicVersionCA({uri, cid, text, title, message, did, id, claimsAuthorship}: {
    uri: string, cid: string, text: string, title: string, message: string, did: string, id: string, claimsAuthorship: boolean}){
    try {
        await db.topic.upsert({
            create: {
                id: id
            },
            update: {

            },
            where: {
                id: id
            }
        })
        await db.topicVersion.create({
            data: {
                authorship: claimsAuthorship,
                title: title,
                message: message,
                content: {
                    create: {
                        cid: cid,
                        uri: uri,
                        text: text,
                        type: ContentType.TopicVersionContent,
                        author: {
                            connect: {
                                did: did
                            }
                        }
                    }
                },
                topic: {
                    connect: {
                        id: id
                    }
                }
            }
        })
    } catch (err){
        console.log("Error", err)
        return {error: "Ocurrió un error al crear la nueva versión del tema."}
    }
}


const contentQuery = (includeText: boolean) => ({
    uri: true,
    text: includeText,
    createdAt: true,
    author: {
        select: {
            did: true,
            handle: true
        }
    },
    likes: {
        select: {
            userById: true,
            createdAt: true,
        }
    }
})


const fullTopicQuery = (includeText: boolean) => ({
    id: true,
    protection: true,
    currentVersion: {
        select: {
            cid: true,
            synonyms: true
        },
    },
    referencedBy: {
        select: {
            referencingContent: {
                select: {
                    ...contentQuery(includeText),
                    childrenTree: {
                        select: contentQuery(false)
                    }
                }
            },
        }
    },
    versions: {
        select: {
            cid: true,
            content: {
                select: {
                    ...contentQuery(includeText),
                    childrenTree: {
                        select: contentQuery(false)
                    }
                }
            },
            topicId: true,
            title: true,
            message: true,
            diff: true,
            charsAdded: true,
            accCharsAdded: true,
            contribution: true,
            authorship: true,
            categories: true,
            accepts: {
                select: {
                    cid: true,
                    uri: true,
                    createdAt: true,
                    author: {
                        select: {
                            did: true,
                            handle: true
                        }
                    }
                }
            },
            rejects: {
                select: {
                    cid: true,
                    uri: true,
                    createdAt: true,
                    text: true,
                    author: {
                        select: {
                            did: true,
                            handle: true
                        }
                    }
                }
            },
        }
    }
})


export async function getTopics(route: string[]): Promise<{error?: string, topics?: SmallTopicProps[]}> {
    try {
        const topics: SmallTopicProps[] = await db.topic.findMany({
            select: fullTopicQuery(false)
        })
        return {topics: topics}
    } catch (err) {
        console.log("Error", err)
        return {error: "Error al buscar los temas."}
    }
}


export async function getTopicById(id: string): Promise<{topic?: TopicProps, error?: string}>{

    try {
        const topic = await db.topic.findUnique({
            select: fullTopicQuery(true),
            where: {
                id: id
            }
        })
        return {topic: topic}
    } catch {
        return {error: "No se encontró el tema."}
    }
}

export type ATProtoTopicVersion = {
    uri: string
    cid: string
    value: {
        id: string
        text: string
        createdAt: Date
        title: string
        message: string
    }
}

export async function updateTopics(){
    const {agent, did} = await getSessionAgent()

    const {users, error} = await getUsers()
    if(error) return {error}

    let topicVersions: ATProtoTopicVersion[] = []
    for(let i = 0; i < users.length; i++){
        if(users[i].handle != "tomasdelgado.ar") continue

        console.log("getting topic versions for user", users[i].handle)
        try {
            const res = await agent.com.atproto.repo.listRecords({
                repo: users[i].did,
                collection: 'ar.com.cabildoabierto.topic',
            })
            topicVersions = [...topicVersions, ...res.data.records as ATProtoTopicVersion[]]
        } catch(err){
            console.log("Error", err)
        }
    }

    const curTopicVersions = await db.topicVersion.findMany({
        select: {cid: true, topicId: true}
    })

    for(let i = 0; i < topicVersions.length; i++){
        const v = topicVersions[i]
        if(!curTopicVersions.some((t) => (t.cid == v.cid))){
            await createTopicVersionCA({
                uri: v.uri,
                cid: v.cid,
                id: v.value.id,
                text: v.value.text,
                title: v.value.title,
                message: v.value.message,
                claimsAuthorship: false,
                did: did
            })
        }
    }
}


export async function deleteTopicVersionsForUser(){
    const {agent, did} = await getSessionAgent()

    const {data} = await agent.com.atproto.repo.listRecords({
        repo: did,
        collection: 'ar.com.cabildoabierto.topic',
    })

    for(let i = 0; i < data.records.length; i++){
        await agent.com.atproto.repo.deleteRecord({
            repo: did,
            collection: 'ar.com.cabildoabierto.topic',
            rkey: getRkeyFromUri(data.records[i].uri)
        })
        console.log("deleted", data.records[i].uri)
    }
}