'use server'

import { unstable_cache } from "next/cache";
import { db } from "../db";
import { revalidateEverythingTime } from "./utils";
import { getUserById, getUserId } from "./users";
import { entityInRoute } from "../components/utils";


export const getRouteFeed = (route: string[], userId: string) => {
    return unstable_cache(async () => {
        let feed = await db.content.findMany({
            select: {
                id: true,
                compressedPlainText: true,
                title: true,
                type: true,
                author: {
                    select: {
                        name: true,
                        id: true
                    }
                },
                entityReferences: {
                    select: {
                        id: true,
                        versions: {
                            select: {
                                id: true,
                                categories: true
                            },
                            orderBy: {
                                createdAt: "asc"
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        reactions: true,
                        childrenTree: true,
                    }
                },
                currentVersionOf: {
                    select: {
                        id: true
                    }
                }
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

        if(route.length == 0) return feed
        let routeFeed = feed.filter(({entityReferences}) => {
            return entityReferences.some((entity) => {
                return entityInRoute(entity, route)
            })
        })
        return routeFeed
    }, ["routeFeed", route.join("/"), userId], {
        revalidate: revalidateEverythingTime,
        tags: ["routeFeed", "routeFeed:"+route.join("/"), "feed"]})() 
}


export const getRouteFollowingFeed = async (route: string[], userId?: string) => {
    if(!userId) userId = await getUserId()
    if(!userId) return []
    return unstable_cache(async () => {
        const user = await getUserById(userId)
        if(!user) return []
        let feed: any[] = await db.content.findMany({
            select: {
                id: true,
                compressedPlainText: true,
                title: true,
                author: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                entityReferences: {
                    select: {
                        id: true,
                        versions: {
                            select: {
                                id: true,
                                categories: true,
                            },
                            orderBy: {
                                createdAt: "asc"
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        reactions: true
                    }
                },
                currentVersionOf: {
                    select: {
                        id: true
                    }
                }
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

        if(route.length == 0) return feed
        
        let routeFeed = feed.filter(({entityReferences}) => {
            return entityReferences.some((entity) => {
                return entityInRoute(entity, route)
            })
        })

        return routeFeed
    }, ["routeFollowingFeed", route.join("/"), userId], {
        revalidate: revalidateEverythingTime,
        tags: ["routeFollowingFeed", "routeFollowingFeed:"+route.join("/")+":"+userId, "feed"]})() 
}



export const getDrafts = (userId: string) => {
    return unstable_cache(async () => {
        const drafts = await db.content.findMany({
            select: {
                id: true,
                type: true,
                compressedText: true,
            },
            where: {
                AND: [
                    {isDraft: true},
                    {visible: true},
                    {authorId: userId}
                ]
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return drafts
    }, ["drafts", userId], {
        revalidate: revalidateEverythingTime,
        tags: ["drafts", "drafts:"+userId]})() 
}


export const getProfileFeed = async (userId: string) => {
    return unstable_cache(async () => {
        const feed = await db.content.findMany({
            select: {
                id: true,
                fakeReportsCount: true
            },
            where: {
                AND: [
                    {type: {
                        in: ["FastPost", "Post"]
                    }},
                    {visible: true},
                    {authorId: userId},
                    {isDraft: false}
                ]
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return feed
    }, ["profileFeed", userId], {
        revalidate: revalidateEverythingTime,
        tags: ["profileFeed", "profileFeed:"+userId]})()  
}


export const getRepliesFeed = async (userId: string) => {
    return unstable_cache(async () => {
        const feed = await db.content.findMany({
            select: {
                id: true,
            },
            where: {
                AND: [
                    {type: {
                            in: ["Comment", "FakeNewsReport"]
                        }},
                    {visible: true},
                    {authorId: userId}
                ]
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return feed
    }, ["repliesFeed", userId], {
        revalidate: revalidateEverythingTime,
        tags: ["repliesFeed", "repliesFeed:"+userId]})()
}


export const getEditsFeed = (userId: string) => {
    return unstable_cache(async () => {
        const feed = await db.content.findMany({
            select: {
                id: true,
            },
            where: {
                AND: [
                    {type: {
                            in: ["EntityContent"]
                        }},
                    {visible: true},
                    {authorId: userId}
                ]
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return feed
    }, ["editsFeed", userId], {
        revalidate: revalidateEverythingTime,
        tags: ["editsFeed", "editsFeed:"+userId]})()
}



