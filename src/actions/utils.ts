import {Prisma} from ".prisma/client";
import SortOrder = Prisma.SortOrder;


export const revalidateEverythingTime = 6*3600


export const recordQuery = {
    uri: true,
    cid: true,
    rkey: true,
    collection: true,
    createdAt: true,
    author: {
        select: {
            did: true,
            handle: true,
            displayName: true,
            avatar: true,
            inCA: true
        }
    }
}

export function processReactions(did: string, reactions: {record: {author: {did: string}, collection: string, uri: string}}[]){
    let likeCount = 0
    let repostCount = 0
    let like = undefined
    let repost = undefined
    let participants = new Set<string>()
    if(reactions){
        reactions.forEach((r) => {
            likeCount += r.record.collection == "app.bsky.feed.like" ? 1 : 0
            repostCount += r.record.collection == "app.bsky.feed.repost" ? 1 : 0
            if(r.record.author.did == did){
                if(r.record.collection == "app.bsky.feed.like") like = r.record.uri
                else if(r.record.collection == "app.bsky.feed.repost") repost = r.record.uri
            }
        })
    }
    return {like, repost, likeCount, repostCount, participants}
}


export function addCounters(did: string, elem: any): any {
    if(elem.content && elem.content.post){
        if(elem.content.post.replyTo && elem.content.post.replyTo.reactions != undefined){
            elem.content.post.replyTo = addCounters(did, elem.content.post.replyTo)
        }
        if(elem.content.post.root && elem.content.post.root.reactions != undefined){
            elem.content.post.root = addCounters(did, elem.content.post.root)
        }
    }

    const reactions = elem.reactions
    const {like, repost, likeCount, repostCount, participants} = processReactions(did, reactions)

    if(elem.replies){
        for(let i = 0; i < elem.replies.length; i++){
            const r = elem.replies[i]
            participants.add(r.content.record.userById)
        }
        participants.delete(elem.author.did)
    }

    let viewers = new Set<string>()
    if(elem.views){
        for(let i = 0; i < elem.views.length; i++){
            const v = elem.views[i]
            viewers.add(v.userById)
        }
        viewers.delete(elem.author.did)
    }

    return {
        ...elem,
        viewer: {like, repost},
        likeCount,
        replyCount: elem.replies ? elem.replies.length : (elem._count ? elem._count.replies : undefined),
        repostCount,
        participantsCount: participants.size,
        uniqueViewsCount: viewers.size,
    }
}


export const visualizationQuery = {
    select: {
        spec: true,
        dataset: {
            select: {
                uri: true,
                dataset: {
                    select: {
                        title: true
                    }
                }
            }
        },
        previewBlobCid: true
    }
}


export const datasetQuery = {
    select: {
        title: true,
        columns: true,
        dataBlocks: {
            select: {
                record: {
                    select: recordQuery
                },
                format: true,
                blob: {
                    select: {
                        cid: true,
                        authorId: true
                    }
                }
            },
            orderBy: {
                record: {
                    createdAt: "asc" as SortOrder
                }
            }
        }
    }
}


export const basicUserQuery = {
    select: {
        did: true,
        handle: true,
        displayName: true,
        avatar: true,
        inCA: true
    }
}


export const reactionsQuery = {
    select: {
        record: {
            select: {
                uri: true,
                collection: true,
                author: {
                    select: {
                        did: true,
                        handle: true,
                        displayName: true
                    },
                },
                createdAt: true,
            }
        }
    }
}


const replyToQuery = {
    select: {
        ...recordQuery,
        content: {
            select: {
                text: true,
                post: {
                    select: {
                        replyTo: {
                            select: {
                                uri: true,
                                collection: true,
                                author: {
                                    select: {
                                        did: true,
                                        handle: true,
                                        displayName: true
                                    }
                                },
                                content: {
                                    select: {
                                        article: {
                                            select: {
                                                title: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
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
        },
        reactions: reactionsQuery,
        views: {
            select: {
                createdAt: true,
                userById: true
            }
        },
        replies: {
            select: {
                content: {
                    select: {
                        record: {
                            select: {
                                createdAt: true,
                                authorId: true
                            }
                        }
                    }
                }
            }
        }
    },
}


export const enDiscusionQuery = {
    ...recordQuery,
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
    reactions: reactionsQuery,
    views: {
        select: {
            createdAt: true,
            userById: true
        }
    },
    replies: {
        select: {
            content: {
                select: {
                    record: {
                        select: {
                            createdAt: true,
                            authorId: true
                        }
                    }
                }
            }
        }
    }
}


export const queryPostsFollowingFeedCA = {
    ...recordQuery,
    content: {
        select: {
            text: true,
            numWords: true,
            textBlob: true,
            article: {
                select: {
                    title: true
                }
            }
        }
    },
    reactions: reactionsQuery,
    views: {
        select: {
            userById: true
        }
    },
    _count: {
        select: {
            replies: true
        }
    }
}


export const queryPostsRepliesFeedCA = {
    ...recordQuery,
    content: {
        select: {
            text: true,
            numWords: true,
            textBlob: true,
            article: {
                select: {
                    title: true
                }
            },
            post: {
                select: {
                    embed: true,
                    quote: true,
                    facets: true,
                    replyTo: replyToQuery,
                    root: replyToQuery
                }
            }
        }
    },
    reactions: reactionsQuery,
    views: {
        select: {
            userById: true
        }
    },
    _count: {
        select: {
            replies: true
        }
    }
}


export const feedQuery = {
    ...recordQuery,
    content: {
        select: {
            text: true,
            article: {
                select: {
                    title: true
                }
            },
            post: {
                select: {
                    facets: true,
                    embed: true,
                    replyTo: replyToQuery,
                    root: replyToQuery,
                    quote: true
                }
            },
            topicVersion: {
                select: {
                    topic: {
                        select: {
                            id: true,
                            versions: {
                                select: {
                                    uri: true
                                },
                                orderBy: {
                                    content: {
                                        record: {
                                            createdAt: "asc" as SortOrder
                                        }
                                    }
                                }
                            }
                        }
                    },
                    categories: true,
                    synonyms: true,
                    charsAdded: true,
                    charsDeleted: true
                }
            }
        },
    },
    visualization: visualizationQuery,
    dataset: datasetQuery,
    reactions: reactionsQuery,
    _count: {
        select: {
            replies: true,
        }
    },
    views: {
        select: {
            createdAt: true,
            userById: true
        }
    },
    replies: {
        select: {
            content: {
                select: {
                    record: {
                        select: {
                            createdAt: true,
                            authorId: true
                        }
                    }
                }
            }
        }
    }
}


export const threadRepliesQuery = {
    ...recordQuery,
    content: {
        select: {
            text: true,
            post: {
                select: {
                    facets: true,
                    embed: true,
                    quote: true,
                    replyTo: {
                        select: {
                            uri: true,
                            collection: true,
                            content: {
                                select: {
                                    text: true
                                }
                            }
                        }
                    }
                }
            },
        },
    },
    reactions: reactionsQuery,
    _count: {
        select: {
            replies: true,
        }
    },
    views: {
        select: {
            createdAt: true,
            userById: true
        }
    },
}


export const threadQuery = {
    cid: true,
    uri: true,
    collection: true,
    createdAt: true,
    author: basicUserQuery,
    content: {
        select: {
            text: true,
            article: {
                select: {
                    title: true
                }
            },
            post: {
                select: {
                    facets: true,
                    embed: true,
                    replyTo: {
                        select: {
                            uri: true,
                            cid: true,
                            author: basicUserQuery,
                            content: {
                                select: {
                                    text: true,
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
                                                        },
                                                        orderBy: {
                                                            content: {
                                                                record: {
                                                                    createdAt: "asc" as SortOrder
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            },
                                        }
                                    }
                                }
                            }
                        }
                    },
                    root: {
                        select: {
                            uri: true,
                            cid: true
                        }
                    },
                    quote: true
                }
            },
            topicVersion: {
                select: {
                    topic: {
                        select: {
                            id: true,
                            versions: {
                                select: {
                                    uri: true
                                },
                                orderBy: {
                                    content: {
                                        record: {
                                            createdAt: "asc" as SortOrder
                                        }
                                    }
                                }
                            }
                        }
                    },
                    categories: true,
                    synonyms: true,
                    charsAdded: true,
                    charsDeleted: true
                }
            }
        },
    },
    visualization: visualizationQuery,
    dataset: datasetQuery,
    reactions: reactionsQuery,
    views: {
        select: {
            createdAt: true,
            userById: true
        }
    },
    replies: {
        select: {
            content: {
                select: {
                    record: {
                        select: {
                            createdAt: true,
                            authorId: true
                        }
                    }
                }
            }
        }
    }
}