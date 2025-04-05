"use server"
import {QuotedContent} from "@/components/feed/content-quote";
import {db} from "@/db";
import {getTextFromBlob} from "../topic/topics";
import {unstable_cache} from "next/cache";
import {revalidateEverythingTime} from "../utils";
import {FastPostProps} from "@/lib/definitions";
import {getSessionAgent} from "../auth";
import {getDidFromUri, getUri, splitUri} from "@/utils/uri";


export async function getQuotedContentNoCache({did, rkey}: {did: string, rkey: string}): Promise<QuotedContent> {
    try {
        const q = await db.record.findMany({
            select: {
                uri: true,
                author: {
                    select: {
                        handle: true,
                        displayName: true
                    }
                },
                content: {
                    select: {
                        text: true,
                        textBlob: {
                            select: {
                                cid: true,
                                authorId: true
                            }
                        },
                        format: true,
                        article: {
                            select: {
                                title: true
                            }
                        },
                        topicVersion: {
                            select: {
                                topic: {
                                    select: {
                                        id: true,
                                        versions: {
                                            select: {
                                                title: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            where: {
                uri: {
                    in: [getUri(did, "ar.com.cabildoabierto.article", rkey), getUri(did, "ar.com.cabildoabierto.topic",  rkey)]
                }
            }
        })

        if(q[0].content.textBlob != undefined){
            q[0].content.text = await getTextFromBlob(q[0].content.textBlob)
        }

        return q[0]
    } catch (e) {
        console.error("Error getting quoted content", did, rkey)
        console.error(e)
        return null
    }
}


export async function getQuotedContent({did, rkey}: {did: string, rkey: string}): Promise<QuotedContent> {
    return unstable_cache(async () => {
            return await getQuotedContentNoCache({did, rkey})
        }, ["quotedContent:"+did+":"+rkey],
        {
            tags: ["record:"+did+":"+rkey, "quotedContent"],
            revalidate: revalidateEverythingTime
        })()
}


export async function getBskyFastPost(uri: string): Promise<{post?: FastPostProps, error?: string}>{
    const {agent} = await getSessionAgent()
    const {did, rkey} = splitUri(uri)

    try {
        const {value, uri: postUri} = await agent.getPost({repo: did, rkey})
        const postDid = getDidFromUri(postUri)
        const {data: authorData} = await agent.app.bsky.actor.getProfile({actor: postDid})

        const formattedPost: FastPostProps = {
            uri: uri,
            createdAt: new Date(value.createdAt),
            collection: value.$type as string,
            author: authorData,
            content: {
                text: value.text,
                post: {
                    embed: JSON.stringify(value.embed)
                }
            }
        }
        return {post: formattedPost}
    } catch (e) {
        console.error("Error getting post", e)
        return {error: "Post not found"}
    }
}