import {FeedContentProps} from "../../app/lib/definitions";
import {getSessionDid} from "../auth";
import {db} from "../../db";
import {enDiscusionQuery, reactionsQuery, recordQuery, threadRepliesQuery} from "../utils";
import {addCountersToFeed} from "./utils";
import {getUserEngagementInFeed} from "./inicio";


export async function getTopicFeed(id: string): Promise<{feed?: {mentions: FeedContentProps[], replies: FeedContentProps[], topics: string[]}, error?: string}> {
    const did = await getSessionDid()

    id = decodeURIComponent(id)

    try {

        const getReplies = db.record.findMany({
            select: threadRepliesQuery,
            where: {
                OR: [
                    {
                        content: {
                            post: {
                                replyTo: {
                                    collection: "ar.com.cabildoabierto.topic",
                                    content: {
                                        topicVersion: {
                                            topicId: id
                                        }
                                    }
                                }
                            }
                        }
                    },
                ]
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        const getMentions = db.record.findMany({
            select: {
                ...recordQuery,
                ...reactionsQuery,
                content: {
                    select: {
                        text: true,
                        textBlob: true,
                        article: {
                            select: {
                                title: true
                            }
                        },
                        post: {
                            select: {
                                facets: true,
                                embed: true,
                                quote: true,
                                replyTo: {
                                    select: {
                                        uri: true,
                                        author: {
                                            select: {
                                                did: true,
                                                handle: true,
                                                displayName: true
                                            }
                                        }
                                    }
                                },
                                root: {
                                    select: {
                                        uri: true,
                                        author: {
                                            select: {
                                                did: true,
                                                handle: true,
                                                displayName: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
            },
            where: {
                content: {
                    references: {
                        some: {
                            referencedTopicId: id
                        }
                    }
                },
                collection: {
                    in: ["ar.com.cabildoabierto.article", "ar.com.cabildoabierto.quotePost", "app.bsky.feed.post"]
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        // TO DO: Solo mostrar versiones actuales.
        const getTopicMentions = db.content.findMany({
            select: {
                topicVersion: {
                    select: {
                        topicId: true
                    }
                }
            },
            where: {
                references: {
                    some: {
                        referencedTopicId: id
                    }
                },
                record: {
                    collection: "ar.com.cabildoabierto.topic"
                }
            }
        })

        const [replies, mentions, topicMentions] = await Promise.all([getReplies, getMentions, getTopicMentions])

        const repliesEngagement = await getUserEngagementInFeed(replies, did)
        const mentionsEngagement = await getUserEngagementInFeed(mentions, did)
        const readyForFeedMentions = addCountersToFeed(mentions, mentionsEngagement)
        const readyForFeedReplies = addCountersToFeed(replies, repliesEngagement)

        return {
            feed: {
                mentions: readyForFeedMentions,
                replies: readyForFeedReplies,
                topics: topicMentions.map(t => t.topicVersion.topicId)
            }
        }
    } catch (e) {
        console.error("Error getting topic feed for", id)
        console.error(e)
        return {error: "Ocurrió un error al obtener el feed del tema " + id}
    }
}