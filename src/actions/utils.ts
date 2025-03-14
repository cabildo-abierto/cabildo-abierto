import {Prisma} from ".prisma/client";
import SortOrder = Prisma.SortOrder;
import {FeedEngagementProps} from "../app/lib/definitions";


export const revalidateEverythingTime = 5 // 6*3600


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


export function addCounters(elem: any, engagement: FeedEngagementProps): any {
    if(elem.content && elem.content.post){
        if(elem.content.post.replyTo && elem.content.post.replyTo._count != undefined){
            elem.content.post.replyTo = addCounters(elem.content.post.replyTo, engagement)
        }
        if(elem.content.post.root && elem.content.post.root._count != undefined){
            elem.content.post.root = addCounters(elem.content.post.root, engagement)
        }
    }

    const visualizationsUsingCount = elem.visualizationsUsing ? elem.visualizationsUsing.length : undefined

    let like: string = undefined
    let repost: string = undefined

    engagement.likes.forEach(l => {
        if(l.likedRecordId == elem.uri){
            like = l.uri
        }
    })
    engagement.reposts.forEach(l => {
        if(l.repostedRecordId == elem.uri){
            repost = l.uri
        }
    })

    const viewer = {repost, like}

    return {
        ...elem,
        likeCount: elem._count.likes,
        replyCount: elem._count.replies,
        repostCount: elem._count.reposts,
        visualizationsUsingCount,
        viewer
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
        description: true,
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
    uniqueViewsCount: true,
    _count: {
        select: {
            reposts: true,
            likes: true,
            replies: true
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
    _count: {
        select: {
            replies: true,
            likes: true,
            reposts: true
        }
    },
    uniqueViewsCount: true
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
            textBlob: {
                select: {
                    authorId: true,
                    cid: true
                }
            },
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
    dataset: datasetQuery
}


export function getObjectSizeInBytes(obj) {
    return new TextEncoder().encode(JSON.stringify(obj)).length;
}


export function logTimes(s: string, times: number[]){
    const diffs: number[] = []
    for(let i = 1; i < times.length; i++){
        diffs.push(times[i]-times[i-1])
    }
    const sum = diffs.join(" + ")
    console.log(s, times[times.length-1]-times[0], "=", sum)
}
