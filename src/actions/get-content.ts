'use server'

import {db} from "@/db";
import { cache } from "./cache";
import { getUserById } from "./get-user";


export const getContentById = cache(async (id: string) => {
    let content = await db.content.findUnique({
        select: {
            id: true,
            text: true,
            createdAt: true,
            author: true,
            childrenContents: {
                select: {
                    id: true,
                    createdAt: true
                },
                orderBy: {
                    createdAt: "desc"
                }
            },
            parentContents: {
                select: {
                    id: true
                }
            },
            _count: {
                select: {
                    reactions: true,
                    views: true
                },
            },
            type: true,
            isDraft: true,
            title: true,
            categories: true,
            isUndo: true,
            undoMessage: true
        },
        where: {
            id: id,
        }
    })
    return content
}, ["contents"], {tags: ["contents"]})


export const getFeed = cache(async () => {
    let contents = await db.content.findMany({
        select: {
            id: true,
            type: true,
            isDraft: true,
            text: true,
            entityReferences: {
                select: {
                    id: true,
                    versions: {
                        select: {
                            id: true,
                            categories: true,
                            isUndo: true,
                            undoMessage: true
                        },
                        orderBy: {
                            createdAt: "asc"
                        }
                    }
                }
            },
            isUndo: true,
            undoMessage: true
        },
        where: {
            AND: [
                {type: {
                    in: ["FastPost", "Post"]
                }},
                {visible: true},
                {isDraft: false}
            ]
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
    return contents
}, ["contents"], {tags: ["contents"]})


// TO DO: Tiene sentido esto?
export const getDraftsById = cache(async (id: string) => {
    const drafts = await db.content.findMany({
        select: {
            id: true,
            text: true,
            createdAt: true,
            author: true,
            childrenContents: {
                select: {
                    id: true,
                    createdAt: true
                }
            },
            parentContents: {
                select: {
                    id: true
                }
            },
            _count: {
                select: {
                    reactions: true,
                    views: true
                }
            },
            type: true,
            isDraft: true,
            title: true,
            categories: true
        },
        where: {
            AND: [
                {isDraft: true},
                {visible: true},
                {authorId: id}
            ]
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
    return drafts
}, ["contents"], {tags: ["contents"]})


export const getProfileFeed = cache(async (id: string) => {
    const feed = await db.content.findMany({
        select: {
            id: true,
            type: true,
            isDraft: true,
            text: true,
            entityReferences: {
                select: {
                    id: true,
                    versions: {
                        select: {
                            id: true,
                            categories: true,
                            isUndo: true,
                            undoMessage: true
                        },
                        orderBy: {
                            createdAt: "asc"
                        }
                    }
                }
            },
            isUndo: true,
            undoMessage: true
        },
        where: {
            AND: [
                {type: {
                    in: ["FastPost", "Post"]
                }},
                {visible: true},
                {authorId: id},
                {isDraft: false}
            ]
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
    return feed
}, ["users", "contents"], {tags: ["users", "contents"]})


export const getFollowingFeed = cache(async (id: string) => {
    const user = await getUserById(id)
    if(!user) return []
    const feed = await db.content.findMany({
        select: {
            id: true,
            type: true,
            isDraft: true,
            text: true,
            entityReferences: {
                select: {
                    id: true,
                    versions: {
                        select: {
                            id: true,
                            categories: true,
                            isUndo: true,
                            undoMessage: true
                        },
                        orderBy: {
                            createdAt: "asc"
                        }
                    }
                }
            },
            isUndo: true,
            undoMessage: true
        },
        where: {
            AND: [
                {type: {
                    in: ["FastPost", "Post"]
                }},
                {visible: true},
                {isDraft: false},
                {authorId: {
                    in: user.following.map(({id}: {id: string}) => (id))
                }}
            ]
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
    return feed
}, ["users", "contents"], {tags: ["users", "contents"]})


export const getContentViews = cache(async (id: string) => {
    let content = await db.content.findUnique({
        select: {
            views: {
                select: {
                    id: true
                },
                distinct: ["userById"]
            },
        },
        where: {
            id: id,
        }
    })
    return content?.views.length
}, ["views"], {tags: ["views"]})