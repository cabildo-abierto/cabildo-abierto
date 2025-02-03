"use server"

import {getSessionAgent} from "./auth";
import {FeedContentProps, TopicProps, TopicVersionProps, TrendingTopicProps} from "../app/lib/definitions";
import {db} from "../db";
import {getRkeyFromUri, supportDid} from "../components/utils";
import {Prisma} from ".prisma/client";
import SortOrder = Prisma.SortOrder;
import {feedQuery, recordQuery} from "./utils";
import {getUserId} from "./users";


export async function createTopic(id: string){
    return await createTopicVersion({id, claimsAuthorship: true})
}


export async function createTopicVersion({id, text, format="markdown", title, claimsAuthorship, message, createOnATProto=true}: {
    id: string, text?: FormData, format?: string, title?: string, claimsAuthorship: boolean, message?: string, createOnATProto?: boolean}){

    const {agent, did} = await getSessionAgent()
    if(!did) return {error: "Iniciá sesión para crear un tema."}

    let blob = null
    if(text){
        const data = Object.fromEntries(text);
        let f = data.data as File
        console.log("f", f)
        const headers: Record<string, string> = {
            "Content-Length": f.size.toString()
        }
        const res = await agent.uploadBlob(f, {headers})
        blob = res.data.blob
    }

    const record = {
        "$type": "ar.com.cabildoabierto.topic",
        text: blob ? {
            ref: blob.ref,
            mimeType: blob.mimeType,
            size: blob.size,
            $type: "blob"
        } : null,
        title: title,
        format: format,
        message: message,
        id: id,
        createdAt: new Date().toISOString()
    }
    try {
        await agent.com.atproto.repo.createRecord({
            repo: did,
            collection: 'ar.com.cabildoabierto.topic',
            record: record,
        })
    } catch (e) {
        console.log("error", e)
        return {error: "Ocurrió un error al publicar en ATProto."}
    }

    return {}
}

const smallRecordQuery = {
    createdAt: true,
    authorId: true
}


const topicVersionReactionsQuery = {
    select: {
        reactsTo: {
            select: {
                cid: true,
                uri: true,
                createdAt: true,
                authorId: true
            }
        },
    },
    where: {
        record: {
            collection: {
                in: ["ar.com.cabildoabierto.topic.accept", "ar.com.cabildoabierto.topic.reject"]
            }
        }
    }
}


type TopicUserInteractionsProps = {
    id: string
    currentVersion?: {
        content: {
            numWords?: number
            record: {
                createdAt: Date
            }
        }
    }
    referencedBy: {
        referencingContent: {
            record: {
                createdAt: Date
                authorId: string
                rootOf: {
                    content: {
                        record: {
                            createdAt: Date
                            authorId: string
                            reactions: {
                                record: {
                                    createdAt: Date
                                    authorId: string
                                }
                            }[]
                        }
                    }
                }[]
                reactions: {
                    record: {
                        createdAt: Date
                        authorId: string
                    }
                }[]
            }
        }
    }[]
    versions: {
        title?: string
        categories?: string
        content: {
            record: {
                authorId: string
                createdAt: Date
                rootOf: {
                    content: {
                        record: {
                            createdAt: Date
                            authorId: string
                            reactions: {
                                record: {
                                    createdAt: Date
                                    authorId: string
                                }
                            }[]
                        }
                    }
                }[]
            }
        }
    }[]
}


function countUserInteractions(entity: TopicUserInteractionsProps, since?: Date){
    function recentEnough(date: Date){
        return !since || date > since
    }

    function addMany(g: {authorId: string, createdAt: Date}[]){
        for(let i = 0; i < g.length; i++) {
            if(recentEnough(g[i].createdAt)){
                s.add(g[i].authorId)
            }
        }
    }

    let s = new Set()

    entity.referencedBy.forEach(({referencingContent}) => {
        if(recentEnough(referencingContent.record.createdAt)){
            s.add(referencingContent.record.authorId)
        }
    })

    for(let i = 0; i < entity.referencedBy.length; i++){
        const referencingContent = entity.referencedBy[i].referencingContent
        addMany(referencingContent.record.rootOf.map((post) => (post.content.record)))
        for(let j = 0; j < referencingContent.record.rootOf.length; j++){
            addMany(referencingContent.record.rootOf[j].content.record.reactions.map(({record}) => (record)))
        }
        addMany(referencingContent.record.reactions.map(({record}) => (record)))
    }

    //if(entity.name == entityId) console.log("Referencias", s)
    //if(entity.name == entityId) console.log("Reacciones", s)
    for(let i = 0; i < entity.versions.length; i++){
        // autores de las versiones
        if(recentEnough(entity.versions[i].content.record.createdAt)){
            s.add(entity.versions[i].content.record.authorId)
        }

        // comentarios y subcomentarios de las versiones
        addMany(entity.versions[i].content.record.rootOf.map((post) => (post.content.record)))
    }

    //if(entity.name == entityId) console.log("weak refs", s)
    //if(entity.name == entityId) console.log("Total", entity.name, s.size, s)

    s.delete(supportDid)

    return [
        s.size,
        entity.currentVersion && entity.currentVersion.content.numWords > 0 ? 1 : 0,
        entity.currentVersion ? new Date(entity.currentVersion.content.record.createdAt).getTime() : 0
    ]

}


export async function getTrendingTopics(sinceKind: string): Promise<{error?: string, topics?: TrendingTopicProps[]}> {
    // sinceKind is always alltime
    const since = undefined

    try {

        const topics = await db.topic.findMany({
            select: {
                id: true,
                currentVersion: {
                    select: {
                        uri: true,
                        content: {
                            select: {
                                numWords: true,
                                record: {
                                    select: {
                                        createdAt: true
                                    }
                                }
                            }
                        }
                    }
                },
                referencedBy: {
                    select: {
                        referencingContent: {
                            select: {
                                record: {
                                    select: {
                                        ...smallRecordQuery,
                                        rootOf: {
                                            select: {
                                                content: {
                                                    select: {
                                                        record: {
                                                            select: {
                                                                ...smallRecordQuery,
                                                                reactions: {
                                                                    select: {
                                                                        record: {
                                                                            select: smallRecordQuery
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        reactions: {
                                            select: {
                                                record: {
                                                    select: smallRecordQuery
                                                }
                                            }
                                        }
                                    }
                                },
                            }
                        },
                    }
                },
                versions: {
                    select: {
                        uri: true,
                        title: true,
                        categories: true,
                        content: {
                            select: {
                                numWords: true,
                                record: {
                                    select: {
                                        ...smallRecordQuery,
                                        reactions: topicVersionReactionsQuery,
                                        author: {
                                            select: {
                                                handle: true
                                            }
                                        },
                                        createdAt: true,
                                        rootOf: {
                                            select: {
                                                content: {
                                                    select: {
                                                        record: {
                                                            select: {
                                                                ...smallRecordQuery,
                                                                reactions: {
                                                                    select: {
                                                                        record: {
                                                                            select: smallRecordQuery
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                    }
                                },
                            }
                        }
                    },
                    orderBy: {
                        content: {
                            record: {
                                createdAt: "asc"
                            }
                        }
                    }
                }
            },
            where: {
                versions: {
                    some: {
                    }
                }
            }
        })
        const topicsWithScore = topics.map((topic) => {
            return {
                ...topic,
                score: countUserInteractions(topic, since)
            }
        })
        return {topics: topicsWithScore}
    } catch (err) {
        console.log("Error", err)
        return {error: "Error al buscar los temas."}
    }
}


const topicQuery = (includeText: boolean, includeReplies: boolean) => ({
    id: true,
    protection: true,
    currentVersion: {
        select: {
            uri: true
        },
    },
    versions: {
        select: {
            uri: true,
            content: {
                select: {
                    text: includeText,
                    format: true,
                    record: {
                        select: {
                            createdAt: true,
                            cid: true,
                            uri: true,
                            author: {
                                select: {
                                    did: true,
                                    handle: true,
                                    avatar: true,
                                    displayName: true
                                }
                            },
                            reactions: {
                                select: {
                                    record: {
                                        select: {
                                            authorId: true,
                                            collection: true
                                        }
                                    }
                                },
                                where: {
                                    reactsTo: {
                                        collection: {
                                            in: ["ar.com.cabildoabierto.topic.accept", "ar.com.cabildoabierto.topic.reject"]
                                        }
                                    }
                                }
                            },
                            replies: includeReplies ? {
                                select: {
                                    content: {
                                        select: {
                                            text: true,
                                            record: {
                                                select: recordQuery,
                                            }
                                        }
                                    }
                                }
                            } : undefined
                        }
                    },
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
            categories: true
        },
        orderBy: {
            content: {
                record: {
                    createdAt: "asc" as SortOrder
                }
            }
        }
    }
})


export async function getTopics(){
    const topics = await db.topic.findMany({
        select: topicQuery(false, false),
        where: {
            versions: {
                some: {
                }
            }
        }
    })

    return {topics: topics}
}


export async function getTopicById(id: string): Promise<{topic?: TopicProps, error?: string}>{
    try {
        const topic: TopicProps = await db.topic.findUnique({
            select: topicQuery(true, true),
            where: {
                id: id
            }
        })

        return {topic: topic}
    } catch {
        return {error: "No se encontró el tema."}
    }
}


export async function getTopicVersion(uri: string){
    try {
        const topic: TopicVersionProps = await db.topicVersion.findUnique({
            select: {
                uri: true,
                topicId: true,
                message: true,
                title: true,
                diff: true,
                charsAdded: true,
                accCharsAdded: true,
                contribution: true,
                authorship: true,
                content: {
                    select: {
                        text: true,
                        format: true,
                        record: {
                            select: recordQuery,
                        },
                    },
                }
            },
            where: {
                uri: uri
            }
        })

        return {topic: topic}
    } catch {
        return {error: "No se encontró el tema."}
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