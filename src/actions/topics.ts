"use server"

import {getSessionAgent} from "./auth";
import {TopicProps, TrendingTopicProps} from "../app/lib/definitions";
import {db} from "../db";
import {getRkeyFromUri, supportDid} from "../components/utils";


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
        await agent.com.atproto.repo.createRecord({
            repo: did,
            collection: 'ar.com.cabildoabierto.topic',
            record: record,
        })
    } catch (e) {
        return {error: "Ocurrió un error al publicar en ATProto."}
    }

    return {}
}

const smallContentQuery = {
    record: {
        select: {
            createdAt: true,
            authorId: true
        }
    }
}


const topicVersionReactionsQuery = {
    select: {
        reactsTo: {
            select: {
                record: {
                    select: {
                        cid: true,
                        uri: true,
                        createdAt: true,
                        authorId: true
                    }
                }
            }
        },
    },
    where: {
        reactsTo: {
            record: {
                collection: {
                    in: ["ar.com.cabildoabierto.topic.accept", "ar.com.cabildoabierto.topic.reject"]
                }
            }
        }
    }
}


type TopicUserInteractionsProps = {
    referencedBy: {
        referencingContent: {
            record: {
                createdAt: Date
                authorId: string
            }
            childrenTree: {
                record: {
                    createdAt: Date
                    authorId: string
                }
                reactions: {
                    record: {
                        createdAt: Date
                        authorId: string
                    }
                }[]
            }[]
            reactions: {
                record: {
                    createdAt: Date
                    authorId: string
                }
            }[]
        }
    }[]
    versions: {
        title?: string
        categories?: string
        content: {
            record: {
                authorId: string
                createdAt: Date
            }
            childrenTree: {
                record: {
                    createdAt: Date
                    authorId: string
                }
                reactions: {
                    record: {
                        createdAt: Date
                        authorId: string
                    }
                }[]
            }[]
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
        addMany(referencingContent.childrenTree.map(({record}) => (record)))
        for(let j = 0; j < referencingContent.childrenTree.length; j++){
            addMany(referencingContent.childrenTree[j].reactions.map(({record}) => (record)))
        }
        addMany(referencingContent.reactions.map(({record}) => (record)))
    }

    //if(entity.name == entityId) console.log("Referencias", s)
    //if(entity.name == entityId) console.log("Reacciones", s)
    for(let i = 0; i < entity.versions.length; i++){
        // autores de las versiones

        if(recentEnough(entity.versions[i].content.record.createdAt)){
            s.add(entity.versions[i].content.record.authorId)
        }

        // comentarios y subcomentarios de las versiones
        addMany(entity.versions[i].content.childrenTree.map(({record}) => (record)))
    }

    //if(entity.name == entityId) console.log("weak refs", s)
    //if(entity.name == entityId) console.log("Total", entity.name, s.size, s)

    s.delete(supportDid)
    return s.size
}


export async function getTrendingTopics(since: Date): Promise<{error?: string, topics?: TrendingTopicProps[]}> {
    const topics = await db.topic.findMany({
        select: {
            id: true,
            versions: {
                select: {
                    title: true
                }
            }
        }
    })
    const topicsWithScore = topics.map((t) => ({...t, score: [1]}))
    return {topics: topicsWithScore}
    // [topic.score, topic.currentVersion.content.numWords > 0 ? 1 : 0, new Date(topic.currentVersion.content.record.createdAt).getTime()]
    /*try {

        const topics = await db.topic.findMany({
            select: {
                id: true,
                currentVersion: {
                    select: {
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
                                ...smallContentQuery,
                                childrenTree: {
                                    select: {
                                        ...smallContentQuery,
                                        reactions: {
                                            select: smallContentQuery
                                        }
                                    }
                                },
                                reactions: {
                                    select: smallContentQuery
                                }
                            }
                        },
                    }
                },
                versions: {
                    select: {
                        title: true,
                        categories: true,
                        content: {
                            select: {
                                ...smallContentQuery,
                                numWords: true,
                                childrenTree: {
                                    select: {
                                        ...smallContentQuery,
                                        reactions: {
                                            select: smallContentQuery
                                        }
                                    }
                                },
                                reactions: topicVersionReactionsQuery
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
    }*/
}


export async function getTopics(){
    return {topics: []}
}


export async function getTopicById(id: string): Promise<{topic?: TopicProps, error?: string}>{
    try {
        const topic: TopicProps = await db.topic.findUnique({
            select: {
                id: true,
                protection: true,
                currentVersion: {
                    select: {
                        cid: true
                    },
                },
                versions: {
                    select: {
                        cid: true,
                        content: {
                            select: {
                                record: {
                                    select: {
                                        createdAt: true,
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
                                        }
                                    }
                                },
                                text: true,
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
                    }
                }
            },
            where: {
                id: id
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