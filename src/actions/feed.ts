'use server'

import { unstable_cache } from "next/cache";
import { db } from "../db";
import { revalidateEverythingTime } from "./utils";
import { getUserById, getUserId } from "./users";
import { entityInRoute } from "../components/utils";
import { ContentProps } from "../app/lib/definitions";


const revalidateFeedTime = 10*60


export const getRouteFeed = (route: string[], userId?: string) => {
    return unstable_cache(async () => {
        let feed: ContentProps[] = await db.content.findMany({
            select: {
                id: true,
                type: true,
                compressedText: true,
                compressedPlainText: true,
                childrenTree: {
                    select: {
                        authorId: true
                    }
                },
                title: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                createdAt: true,
                _count: {
                    select: {
                        reactions: true,
                        childrenTree: true
                    }
                },
                claimsAuthorship: true,
                stallPaymentUntil: true,
                fakeReportsCount: true,
                uniqueViewsCount: true,
                reactions: userId ? {
                    select: {
                        id: true
                    },
                    where: {
                        userById: userId
                    }
                } : false,
                views: userId ? {
                    select: {
                        id: true
                    },
                    where: {
                        userById: userId
                    }
                } : false,
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
                parentEntityId: true, // TO DO: Eliminar
                parentEntity: {
                    select: {
                        id: true,
                        isPublic: true,
                        currentVersion: {
                            select: {
                                searchkeys: true
                            }
                        }
                    }
                },
                accCharsAdded: true,
                contribution: true,
                charsAdded: true,
                charsDeleted: true,
                diff: true,
                currentVersionOf: {
                    select: {
                        id: true
                    }
                },
                categories: true,
                undos: {
                    select: {
                        id: true,
                        reportsOportunism: true,
                        reportsVandalism: true,
                        authorId: true,
                        createdAt: true,
                        compressedText: true
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                },
                contentUndoneId: true,
                reportsOportunism: true,
                reportsVandalism: true,
                ancestorContent: {
                    select: {
                        id: true,
                        authorId: true
                    }
                },
                childrenContents: {
                    select: {
                        id: true,
                        createdAt: true,
                        type: true,
                        _count: {
                            select: {
                                childrenTree: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                },
                isContentEdited: true,
                isDraft: true,
                usersMentioned: {
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
        revalidate: revalidateFeedTime,
        tags: ["routeFeed", "routeFeed:"+route.join("/"), "feed", "routeFeed:"+route.join("/")+":"+userId]})() 
}


export const getRouteFollowingFeed = async (route: string[], userId?: string) => {
    if(!userId) userId = await getUserId()
    if(!userId) return []
    return unstable_cache(async () => {
        const {user, error} = await getUserById(userId)
        if(error) return {error}
        
        if(!user) return []
        
        const following = [...user.following.map(({id}: {id: string}) => (id)), "soporte", user.id]
        
        let feed: ContentProps[] = await db.content.findMany({
            select: {
                id: true,
                type: true,
                compressedText: true,
                compressedPlainText: true,
                childrenTree: {
                    select: {
                        authorId: true
                    }
                },
                title: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                createdAt: true,
                _count: {
                    select: {
                        reactions: true,
                        childrenTree: true
                    }
                },
                claimsAuthorship: true,
                stallPaymentUntil: true,
                rootContentId: true,
                fakeReportsCount: true,
                uniqueViewsCount: true,
                reactions: userId ? {
                    select: {
                        id: true
                    },
                    where: {
                        userById: userId
                    }
                } : false,
                views: userId ? {
                    select: {
                        id: true
                    },
                    where: {
                        userById: userId
                    }
                } : false,
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
                parentEntityId: true, // TO DO: Eliminar
                parentEntity: {
                    select: {
                        id: true,
                        isPublic: true,
                        currentVersion: {
                            select: {
                                searchkeys: true
                            }
                        }
                    }
                },
                accCharsAdded: true,
                contribution: true,
                charsAdded: true,
                charsDeleted: true,
                diff: true,
                currentVersionOf: {
                    select: {
                        id: true
                    }
                },
                categories: true,
                undos: {
                    select: {
                        id: true,
                        reportsOportunism: true,
                        reportsVandalism: true,
                        authorId: true,
                        createdAt: true,
                        compressedText: true
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                },
                contentUndoneId: true,
                reportsOportunism: true,
                reportsVandalism: true,
                ancestorContent: {
                    select: {
                        id: true,
                        authorId: true
                    }
                },
                childrenContents: {
                    select: {
                        id: true,
                        createdAt: true,
                        type: true,
                        _count: {
                            select: {
                                childrenTree: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                },
                isContentEdited: true,
                isDraft: true,
                usersMentioned: {
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
                        in: following
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
        revalidate: revalidateFeedTime,
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
                type: true,
                compressedText: true,
                compressedPlainText: true,
                childrenTree: {
                    select: {
                        authorId: true
                    }
                },
                title: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                createdAt: true,
                _count: {
                    select: {
                        reactions: true,
                        childrenTree: true
                    }
                },
                claimsAuthorship: true,
                stallPaymentUntil: true,
                rootContentId: true,
                fakeReportsCount: true,
                uniqueViewsCount: true,
                reactions: userId ? {
                    select: {
                        id: true
                    },
                    where: {
                        userById: userId
                    }
                } : false,
                views: userId ? {
                    select: {
                        id: true
                    },
                    where: {
                        userById: userId
                    }
                } : false,
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
                parentEntityId: true, // TO DO: Eliminar
                parentEntity: {
                    select: {
                        id: true,
                        isPublic: true,
                        currentVersion: {
                            select: {
                                searchkeys: true
                            }
                        }
                    }
                },
                accCharsAdded: true,
                contribution: true,
                charsAdded: true,
                charsDeleted: true,
                diff: true,
                currentVersionOf: {
                    select: {
                        id: true
                    }
                },
                categories: true,
                undos: {
                    select: {
                        id: true,
                        reportsOportunism: true,
                        reportsVandalism: true,
                        authorId: true,
                        createdAt: true,
                        compressedText: true
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                },
                contentUndoneId: true,
                reportsOportunism: true,
                reportsVandalism: true,
                ancestorContent: {
                    select: {
                        id: true,
                        authorId: true
                    }
                },
                childrenContents: {
                    select: {
                        id: true,
                        createdAt: true,
                        type: true,
                        _count: {
                            select: {
                                childrenTree: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                },
                isContentEdited: true,
                isDraft: true,
                usersMentioned: {
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
                type: true,
                compressedText: true,
                compressedPlainText: true,
                childrenTree: {
                    select: {
                        authorId: true
                    }
                },
                title: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                createdAt: true,
                _count: {
                    select: {
                        reactions: true,
                        childrenTree: true
                    }
                },
                claimsAuthorship: true,
                stallPaymentUntil: true,
                rootContentId: true,
                fakeReportsCount: true,
                uniqueViewsCount: true,
                reactions: userId ? {
                    select: {
                        id: true
                    },
                    where: {
                        userById: userId
                    }
                } : false,
                views: userId ? {
                    select: {
                        id: true
                    },
                    where: {
                        userById: userId
                    }
                } : false,
                parentContents: {
                    select: {
                        id: true,
                        author: {
                            select: {
                                id: true,
                            }
                        },
                        parentEntityId: true,
                        type: true,
                        title: true
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
                parentEntityId: true, // TO DO: Eliminar
                parentEntity: {
                    select: {
                        id: true,
                        isPublic: true,
                        currentVersion: {
                            select: {
                                searchkeys: true
                            }
                        }
                    }
                },
                accCharsAdded: true,
                contribution: true,
                charsAdded: true,
                charsDeleted: true,
                diff: true,
                currentVersionOf: {
                    select: {
                        id: true
                    }
                },
                categories: true,
                undos: {
                    select: {
                        id: true,
                        reportsOportunism: true,
                        reportsVandalism: true,
                        authorId: true,
                        createdAt: true,
                        compressedText: true
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                },
                contentUndoneId: true,
                reportsOportunism: true,
                reportsVandalism: true,
                ancestorContent: {
                    select: {
                        id: true,
                        authorId: true
                    }
                },
                childrenContents: {
                    select: {
                        id: true,
                        createdAt: true,
                        type: true,
                        _count: {
                            select: {
                                childrenTree: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                },
                isContentEdited: true,
                isDraft: true,
                usersMentioned: {
                    select: {
                        id: true
                    }
                },
                rootContent: {
                    select: {
                        id: true,
                        author: {
                            select: {
                                id: true,
                            }
                        },
                        parentEntityId: true,
                        type: true,
                        title: true
                    }
                }
            },
            where: {
                AND: [
                    {type: {
                            in: ["Comment", "FakeNewsReport"]
                        }},
                    {visible: true},
                    {rootContent: {
                        isDraft: false
                    }},
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


export const getEditsFeed = (profileUserId: string) => {
    return unstable_cache(async () => {
        const feed: ContentProps[] = await db.content.findMany({
            select: {
                id: true,
                type: true,
                childrenTree: {
                    select: {
                        authorId: true
                    }
                },
                title: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                createdAt: true,
                _count: {
                    select: {
                        reactions: true,
                        childrenTree: true
                    }
                },
                claimsAuthorship: true,
                stallPaymentUntil: true,
                rootContentId: true,
                fakeReportsCount: true,
                uniqueViewsCount: true,
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
                parentEntityId: true, // TO DO: Eliminar
                parentEntity: {
                    select: {
                        id: true,
                        isPublic: true,
                        currentVersion: {
                            select: {
                                searchkeys: true
                            }
                        }
                    }
                },
                accCharsAdded: true,
                contribution: true,
                charsAdded: true,
                charsDeleted: true,
                diff: true,
                currentVersionOf: {
                    select: {
                        id: true
                    }
                },
                categories: true,
                undos: {
                    select: {
                        id: true,
                        reportsOportunism: true,
                        reportsVandalism: true,
                        authorId: true,
                        createdAt: true,
                        compressedText: true
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                },
                contentUndoneId: true,
                reportsOportunism: true,
                reportsVandalism: true,
                ancestorContent: {
                    select: {
                        id: true,
                        authorId: true
                    }
                },
                childrenContents: {
                    select: {
                        id: true,
                        createdAt: true,
                        type: true,
                        _count: {
                            select: {
                                childrenTree: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                },
                isContentEdited: true,
                isDraft: true,
                usersMentioned: {
                    select: {
                        id: true
                    }
                }
            },
            where: {
                AND: [
                    {type: {
                            in: ["EntityContent"]
                        }},
                    {visible: true},
                    {authorId: profileUserId},
                    {parentEntity: {
                        deleted: false
                    }}
                ]
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return feed
    }, ["editsFeed", profileUserId], {
        revalidate: revalidateEverythingTime,
        tags: ["editsFeed", "editsFeed:"+profileUserId]})()
}


export const getSearchableContents = (route: string[], userId?: string) => {
    return unstable_cache(async () => {
        let feed = await db.content.findMany({
            select: {
                id: true,
                type: true,
                compressedText: true,
                compressedPlainText: true,
                childrenTree: {
                    select: {
                        authorId: true
                    }
                },
                title: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                createdAt: true,
                _count: {
                    select: {
                        reactions: true,
                        childrenTree: true
                    }
                },
                claimsAuthorship: true,
                stallPaymentUntil: true,
                rootContent: {
                    select: {
                        id: true,
                        author: {
                            select: {
                                id: true,
                            }
                        },
                        parentEntityId: true,
                        type: true,
                        title: true
                    }
                },
                fakeReportsCount: true,
                uniqueViewsCount: true,
                reactions: userId ? {
                    select: {
                        id: true
                    },
                    where: {
                        userById: userId
                    }
                } : false,
                views: userId ? {
                    select: {
                        id: true
                    },
                    where: {
                        userById: userId
                    }
                } : false,
                parentContents: {
                    select: {
                        id: true,
                        author: {
                            select: {
                                id: true,
                            }
                        },
                        parentEntityId: true,
                        type: true,
                        title: true
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
                parentEntityId: true, // TO DO: Eliminar
                parentEntity: {
                    select: {
                        id: true,
                        isPublic: true,
                        currentVersion: {
                            select: {
                                searchkeys: true
                            }
                        }
                    }
                },
                accCharsAdded: true,
                contribution: true,
                charsAdded: true,
                charsDeleted: true,
                diff: true,
                currentVersionOf: {
                    select: {
                        id: true
                    }
                },
                categories: true,
                undos: {
                    select: {
                        id: true,
                        reportsOportunism: true,
                        reportsVandalism: true,
                        authorId: true,
                        createdAt: true,
                        compressedText: true
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                },
                contentUndoneId: true,
                reportsOportunism: true,
                reportsVandalism: true,
                ancestorContent: {
                    select: {
                        id: true,
                        authorId: true
                    }
                },
                childrenContents: {
                    select: {
                        id: true,
                        createdAt: true,
                        type: true,
                        _count: {
                            select: {
                                childrenTree: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                },
                isContentEdited: true,
                usersMentioned: {
                    select: {
                        id: true
                    }
                }
            },
            where: {
                AND: [
                    {type: {
                        in: ["FastPost", "Post", "Comment", "FakeNewsReport"]
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
    }, ["routeSearchableContents", route.join("/")], {
        revalidate: revalidateFeedTime,
        tags: ["routeFeed", "routeFeed:"+route.join("/"), "feed"]})() 
}
