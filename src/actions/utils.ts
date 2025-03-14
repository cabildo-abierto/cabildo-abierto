import {Prisma} from ".prisma/client";
import SortOrder = Prisma.SortOrder;
import {FeedEngagementProps} from "../app/lib/definitions";
import {getDidFromUri} from "../components/utils/utils";
import {feedCAQuery} from "./feed/feedCA";


export const revalidateEverythingTime = undefined


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
        likeCount: elem._count ? elem._count.likes : undefined,
        replyCount: elem._count ? elem._count.replies : undefined,
        repostCount: elem._count ? elem._count.reposts : undefined,
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
    uniqueViewsCount: true,
    _count: {
        select: {
            reposts: true,
            likes: true,
            replies: true
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
    ...reactionsQuery,
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
}


export const threadQuery = (c: string) => {

    if(c == "app.bsky.feed.post" || c == "ar.com.cabildoabierto.quotePost"){
        return {
            ...recordQuery,
            ...reactionsQuery,
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
        }
    } else if(c == "ar.com.cabildoabierto.article"){
        return {
            ...recordQuery,
            ...reactionsQuery,
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
                },
            }
        }
    } else if(c == "ar.com.cabildoabierto.visualization"){
        return {
            ...recordQuery,
            ...reactionsQuery,
            visualization: visualizationQuery,
        }
    } else if(c == "ar.com.cabildoabierto.dataset"){
        return {
            ...recordQuery,
            ...reactionsQuery,
            dataset: datasetQuery,
        }

    } else {
        throw Error("Not implemented")
    }
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
