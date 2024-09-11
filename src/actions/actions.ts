'use server'

import { cache } from "./cache";
import { revalidateTag, unstable_cache } from "next/cache";
import { ContentType, ProtectionLevel } from "@prisma/client";
import { db } from "../db";
import { createClient } from "../utils/supabase/server";
import { ContentProps, EntityProps, SmallEntityProps, UserStats } from "src/app/lib/definitions";
import { charDiffFromJSONString, getAllText, nodesCharDiff } from "src/components/diff";
import { arraySum, entityInRoute, sumFromFirstEdit } from "src/components/utils";


export async function getContentById(id: string) {
    return unstable_cache(async () => {
        let content: ContentProps | null = await db.content.findUnique({
            select: {
                id: true,
                text: true,
                createdAt: true,
                author: true,
                parentContents: {
                    select: {
                        id: true
                    }
                },
                type: true,
                isDraft: true,
                title: true,
                categories: true,
                isUndo: true,
                undoMessage: true,
                parentEntityId: true,
                charsAdded: true,
                charsDeleted: true,
                accCharsAdded: true,
                contribution: true,
            },
            where: {
                id: id,
            }
        })
        return content ? content : undefined
    }, ["content", id], {
        tags: ["content", "content:"+id],
        revalidate: 6*3600,
    })()
}


export async function getRootContent(id: string) {
    return unstable_cache(async () => {
        let content = await getContentById(id)
        while(content.parentContents.length > 0){
            content = await getContentById(content.parentContents[0].id)
        }
        return content
    }, ["rootContent", id], {
        tags: ["rootContent", "rootContent:"+id],
        revalidate: 3600*6
    })()
}


export async function getChildrenCount(id: string) {
    return unstable_cache(async () => {
        let comments = await getContentComments(id)
        let count = 0
        for(let i = 0; i < comments.length; i++){
            count += await getChildrenCount(comments[i].id) + 1
        }
        return count
    }, ["childrenCount", id], {
        tags: ["childrenCount", "childrenCount:"+id],
        revalidate: 3600*6
    })()
}


export async function getEntityChildrenCount(id: string) {
    return unstable_cache(async () => {
        let comments = await getEntityComments(id)
        if(comments == null) return null

        let count = 0
        for(let i = 0; i < comments.length; i++){
            count += 1 + await getChildrenCount(comments[i].id)
        }
        return count
    }, ["entityChildrenCount", id], {
        tags: ["entityChildrenCount", "entityChildrenCount:"+id],
        revalidate: 6*3600
    })()
}




export async function getContentComments(id: string) {
    return unstable_cache(async () => {
        let content = await db.content.findUnique({
            select: {
                childrenContents: {
                    select: {
                        id: true,
                        createdAt: true,
                        type: true
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                },
            },
            where: {
                id: id,
            }
        })
        return content?.childrenContents
    }, ["comments", id], {
        revalidate: 3600*6,
        tags: ["comments", "comments:"+id]})()
}


export async function getEntityComments(id: string) {
    return unstable_cache(async () => {
        const entity = await getEntityById(id)
        if(!entity) return null
        let versions = entity.versions
        let comments = []
        for(let i = 0; i < versions.length; i++){
            const versionComments = await getContentComments(versions[i].id)
            comments = [...comments, ...versionComments]
        }
        return comments
    }, ["comments", id], {
        revalidate: 3600*6,
        tags: ["comments", "comments:"+id]})()
}


export async function getEntityTextLength(id: string) {
    return unstable_cache(async () => {
        const entity = await getEntityById(id)
        if(!entity) return null
        if(entity.versions.length < 1) return 0
        const content = await getContentById(entity.versions[entity.versions.length-1].id)
        let text = null
        try {
            text = JSON.parse(content.text)
        } catch {
            ;
        }
        if(!text) return 0
        const length = getAllText(text.root).split(" ").length
        return length
    }, ["entityTextLength", id], {
        revalidate: 6*3600,
        tags: ["entityTextLength", "entityTextLength:"+id]})()
}


export const getFeed = unstable_cache(async () => {
    let feed = await db.content.findMany({
        select: {
            id: true,
            type: true,
            text: true,
            title: true,
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
    return feed
}, ["feed"], {tags: ["feed"]})


export const getRouteFeed = (route: string[]) => {
    return unstable_cache(async () => {
        const feed = await getFeed()
        if(route.length == 0) return feed
        let routeFeed = feed.filter(({entityReferences}) => {
            return entityReferences.some((entity) => {
                return entityInRoute(entity, route)
            })
        })
        return routeFeed
    }, ["routeFeed", route.join("/")], {
        revalidate: 3600*6,
        tags: ["routeFeed", "routeFeed:"+route.join("/"), "feed"]})() 
}


export const getRouteFollowingFeed = (route: string[], userId: string) => {
    return unstable_cache(async () => {
        const feed = await getFollowingFeed(userId)

        if(route.length == 0) return feed
        
        let routeFeed = feed.filter(({entityReferences}) => {
            return entityReferences.some((entity) => {
                return entityInRoute(entity, route)
            })
        })

        return routeFeed
    }, ["routeFollowingFeed", route.join("/")], {
        revalidate: 3600*6,
        tags: ["routeFollowingFeed", "routeFollowingFeed:"+route.join("/"), "feed"]})() 
}


export const getRouteEntities = (route: string[]) => {
    return unstable_cache(async () => {
        const entities = await getEntities()

        if(route.length == 0) return entities

        let routeEntities = entities.filter((entity) => {
            return entityInRoute(entity, route)
        })

        return routeEntities
    }, ["routeEntities", route.join("/")], {
        revalidate: 3600*6,
        tags: ["routeEntities", "routeEntities:"+route.join("/"), "entities"]})() 
}


export const getDrafts = (userId: string) => {
    return unstable_cache(async () => {
        const drafts = await db.content.findMany({
            select: {
                id: true,
                type: true,
                text: true,
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
        revalidate: 3600*6,
        tags: ["drafts", "drafts:"+userId]})() 
}


export const getProfileFeed = (userId: string) => {
    return unstable_cache(async () => {
        const feed = await db.content.findMany({
            select: {
                id: true,
                type: true,
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
        revalidate: 3600*6,
        tags: ["profileFeed", "profileFeed:"+userId]})()  
}


export const getRepliesFeed = (userId: string) => {
    return unstable_cache(async () => {
        const feed = await db.content.findMany({
            select: {
                id: true,
                type: true,
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
        revalidate: 3600*6,
        tags: ["repliesFeed", "repliesFeed:"+userId]})()
}


export const getEditsFeed = (userId: string) => {
    return unstable_cache(async () => {
        const feed = await db.content.findMany({
            select: {
                id: true,
                type: true,
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
        revalidate: 3600*6,
        tags: ["editsFeed", "editsFeed:"+userId]})()
}



export const getFollowingFeed = (userId: string) => {
    return unstable_cache(async () => {
        const user = await getUserById(userId)
        if(!user) return []
        const feed = await db.content.findMany({
            select: {
                id: true,
                type: true,
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
    }, ["followingFeed", userId], {
        revalidate: 3600*6,
        tags: ["followingFeed", "followingFeed:"+userId]})()    
}


export const getContentViews = (contentId: string) => {
    return unstable_cache(async () => {
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
                id: contentId,
            }
        })
        return content?.views.length
    }, ["views", contentId], {
        revalidate: 3600*6,
        tags: ["views", "views:"+contentId]})()    
}


export const getFakeNewsCount = (contentId: string) => {
    return unstable_cache(async () => {
        let content = await db.content.findUnique({
            select: {
                _count: {
                    select: {
                        childrenContents: {
                            where: {
                                type: "FakeNewsReport"
                            }
                        }
                    }
                },
            },
            where: {
                id: contentId,
            }
        })
        return content?._count.childrenContents
    }, ["fake-news", contentId], {
        revalidate: 3600*6,
        tags: ["fake-news", "views:"+contentId]})()    
}


export const getContentReactions = (contentId: string) => {
    return unstable_cache(async () => {
        let content = await db.content.findUnique({
            select: {
                _count: {
                    select: {
                        reactions: true
                    }
                },
            },
            where: {
                id: contentId,
            }
        })
        return content?._count.reactions
    }, ["reactions", contentId], {
        revalidate: 3600*6,
        tags: ["reactions", "reactions:"+contentId]})()    
}


export const userLikesContent = async (contentId: string, userId: string | null) => {
    if(!userId) return [false, await getContentReactions(contentId)]
    return await unstable_cache(async () => {
        let content = await db.reaction.findFirst({
            select: {
                id: true
            },
            where: {
                contentId: contentId,
                userById: userId
            }
        })
        return [content !== null, await getContentReactions(contentId)]
    }, ["userLikesContent", contentId, userId], {
        revalidate: 3600*6,
        tags: ["userLikesContent", "userLikesContent:"+contentId+":"+userId]})()    
}


export async function createComment(text: string, parentContentId: string, userId: string) {
    let references = await findReferences(text)

    const parentEntityId = (await getContentById(parentContentId)).parentEntityId
    const comment = await db.content.create({
        data: {
            text: text,
            authorId: userId,
            type: "Comment",
            parentContents: {
                connect: [{id: parentContentId}]
            },
            entityReferences: {
                connect: references
            }
        },
    })

    if(parentEntityId){
        revalidateTag("comments:"+parentEntityId)
        revalidateTag("entityChildrenCount:"+parentEntityId)
    }
    revalidateTag("comments:"+parentContentId)
    revalidateTag("repliesFeed:"+userId)

    while(true){
        revalidateTag("childrenCount:"+parentContentId)
        let parent = await getContentById(parentContentId)
        if(parent.parentContents.length > 0)
            parentContentId = parent.parentContents[0].id
        else
            break
    }

    if(parentContentId){
        const rootContent = await getContentById(parentContentId)

        revalidateTag("entityChildrenCount:"+rootContent.parentEntityId)
    }


    return comment
}

export async function findReferences(text: string){

    function findReferencesInNode(node: any): {id: string}[] {
        let references: {id: string}[] = []
        if(node.type === "link"){
            if(node.url.startsWith("/articulo/")){
                const id = node.url.split("/articulo/")[1]
                references.push({id: id})
            }
        }
        if(node.children){
            for(let i = 0; i < node.children.length; i++) {
                const childRefs = findReferencesInNode(node.children[i])
                childRefs.forEach((x) => {references.push(x)})
            }
        }
        return references
    }

    const json  = JSON.parse(text)

    let references: {id: string}[] = findReferencesInNode(json.root)
    
    const entities = await getEntities()

    references = references.filter(({id}) => (entities.some((e) => (e.id == id))))

    return references
}


export async function createPost(text: string, postType: ContentType, isDraft: boolean, userId: string, title?: string) {
    let references = await findReferences(text)

    const result = await db.content.create({
        data: {
            text: text,
            authorId: userId,
            type: postType,
            isDraft: isDraft,
            title: title,
            entityReferences: {
                connect: references
            }
        },
    })

    revalidateTag("feed")
    revalidateTag("followingFeed")
    revalidateTag("profileFeed:"+userId)
    if(postType == "Post")
        revalidateTag("userContents:"+userId)
    if(isDraft)
        revalidateTag("drafts:"+userId)
    references.forEach(({id}) => {
        revalidateTag("entity:"+id)
    })
    return result
}


export async function updateContent(text: string, contentId: string, title?: string) {

    let references = await findReferences(text)
    const result = await db.content.update({
        where: {
            id: contentId
        },
        data: {
            text: text,
            title: title,
            entityReferences: {
                connect: references
            }
        }
    })

    revalidateTag("content:"+contentId)
    return result
}


export async function publishDraft(text: string, contentId: string, userId: string, title?: string) {

    let references = await findReferences(text)
    
    const result = await db.content.update({
        where: {
            id: contentId
        },
        data: {
            text: text,
            isDraft: false,
            createdAt: new Date(),
            title: title,
            entityReferences: {
                connect: references
            }
        }
    })
    revalidateTag("content:"+contentId)
    revalidateTag("feed")
    revalidateTag("followingFeed")
    revalidateTag("profileFeed:"+userId)
    revalidateTag("drafts:"+userId)
    return result
}


export async function createFakeNewsReport(text: string, parentContentId: string, userId: string) {
    let references = await findReferences(text)

    const report = await db.content.create({
        data: {
            text: text,
            authorId: userId,
            type: "FakeNewsReport",
            parentContents: {
                connect: [{id: parentContentId}]
            },
            entityReferences: {
                connect: references
            }
        },
    })
    revalidateTag("content:"+parentContentId)
    revalidateTag("comments:"+parentContentId)
    revalidateTag("repliesFeed:"+userId)
    return report
}


export async function updateDescription(text: string, userId: string) {
    await db.user.update({
        data: {
            description: text
        },
        where: {
            id: userId
        }
    })
    revalidateTag("user:"+userId)
}


export const getUsers = unstable_cache(async () => {
    const users = await db.user.findMany(
        {
            select: {
                id: true,
                name: true
            }
        }
    )
    return users
},
    ["users"],
    {
        revalidate: 3600*6,
        tags: ["users"]
    }
)


export const getUsersWithStats = unstable_cache(async () => {
    const users = await getUsers()

    const withStats = []
    for(let i = 0; i < users.length; i++){
        withStats.push({
            user: users[i],
            stats: await getUserStats(users[i].id)
        })
    }
    return withStats
},
    ["usersWithStats"],
    {
        revalidate: 3600,
        tags: ["users", "usersWithStats"]
    }
)


export const getUserById = (userId: string) => {
    return unstable_cache(async () => {
        const user = await db.user.findUnique(
            {
                select: {
                    id: true,
                    name: true,
                    createdAt: true,
                    authenticated: true,
                    editorStatus: true,
                    subscriptionsUsed: true,
                    following: {select: {id: true}},
                    followedBy: {select: {id: true}},
                    authUser: {
                        select: {
                            email: true,
                        }
                    },
                    description: true
                },
                where: {id:userId}
            }
        )
        return user ? user : undefined
    }, ["user", userId], {
        revalidate: 6*3600,
        tags: ["user:"+userId]})()    
}


export const getUserContents = (userId: string) => {
    return unstable_cache(async () => {
        const contents = (await db.user.findUnique(
            {
                select: {
                    contents: {
                        select: {
                            id: true,
                            type: true,
                            parentEntityId: true,
                            _count: {
                                select: {
                                    reactions: true,
                                    views: true
                                }
                            }
                        },
                        where: {
                            type: {
                                in: ["Post", "EntityContent"]
                            }
                        },
                        orderBy: {
                            createdAt: "desc"
                        },
                    },
                },
                where: {
                    id: userId
                }
            }
        )).contents

        return contents ? contents : undefined
    }, ["userContents", userId], {
        revalidate: 3600*6,
        tags: ["userContents:"+userId]})()    
}


export const getUserIdByAuthId = (authId: string) => {
    return unstable_cache(async () => {
        const userId = await db.user.findUnique(
            {
                select: {
                    id: true,
                },
                where: {
                    authUserId: authId
                }
            }
        )
        return userId?.id
    }, ["userIdByAuthId", authId], {
        revalidate: 3600*6,
        tags: ["userIdByAuthId", "userIdByAuthId:"+authId]})()    
}


export async function getUser() {
    const userId = await getUserId()
    if(!userId) return null

    return await getUserById(userId)
}


export async function getUserId() {
    const userAuthId = await getUserAuthId()
    if(!userAuthId) return null

    return await getUserIdByAuthId(userAuthId)
}


export async function getUserAuthId() {

    const supabase = createClient()
    const {data} = await supabase.auth.getUser()

    const userId = data?.user?.id

    return userId
}


export const addLike = async (id: string, userId: string, entityId?: string) => {
    const exists = await db.reaction.findFirst({
        where: {
            userById: userId,
            contentId: id
        }
    })
    if(!exists){
        await db.reaction.create({
            data: {
                userById: userId,
                contentId: id
            },
        })
    }
    revalidateTag("reactions:"+id)
    revalidateTag("userLikesContent:"+id+":"+userId)
    if(entityId)
        revalidateTag("entityReactions:"+entityId)
    const likeCount = await getContentReactions(id)
    return [true, likeCount]
}


export const removeLike = async (id: string, userId: string, entityId?: string) => {
    await db.reaction.deleteMany({
        where: { 
            AND: [
                {contentId: id},
                {userById: userId}
            ]
        }
    })
    revalidateTag("reactions:"+id)
    revalidateTag("userLikesContent:"+id+":"+userId)
    if(entityId)
        revalidateTag("entityReactions:"+entityId)
    const likeCount = await getContentReactions(id)
    return [false, likeCount]
}


export const addView = async (id: string, userId: string, entityId?: string) => {
    const exists = await db.view.findMany({
        select: {
            createdAt: true
        },
        where: {
            AND: [{
                userById: userId
            },{
                contentId: id
            }]
        },
        orderBy: {
            createdAt: "asc"
        }
    })

    function olderThan(seconds: number){
        const dateLast = new Date(exists[exists.length-1].createdAt).getTime()
        const currentDate = new Date().getTime()
        const difference = (currentDate - dateLast) / 1000
        return difference > seconds
    }

    if(exists.length == 0 || olderThan(3600)){
        await db.view.create({
            data: {
                userById: userId,
                contentId: id
            },
        })
        revalidateTag("views:"+id)
        if(entityId) revalidateTag("entityViews:"+entityId)
    }
    return await getContentViews(id)
}


export async function follow(userToFollowId: string, userId: string) {
    const updatedUser = await db.user.update({
        where: {
            id: userId,
        },
        data: {
            following: {
                connect: {
                    id: userToFollowId,
                },
            },
        },
    });
    revalidateTag("user:"+userToFollowId)
    revalidateTag("user:"+userId)
    return updatedUser;
}


export async function unfollow(userToUnfollowId: string, userId: string) {

    const updatedUser = await db.user.update({
        where: {
            id: userId,
        },
        data: {
            following: {
                disconnect: {
                    id: userToUnfollowId,
                },
            },
        },
    });
    revalidateTag("user:"+userToUnfollowId)
    revalidateTag("user:"+userId)
    return updatedUser;
}


export async function createEntity(name: string, userId: string){
    const entityId = encodeURIComponent(name.replaceAll(" ", "_"))
    const exists = await db.entity.findFirst({
      where: {id: entityId}
    })
    if(exists) return {error: "Ya existe un artículo con ese nombre"}
  
  
    await db.entity.create({
      data: {
        name: name,
        id: entityId,
      }
    })
  
    await db.content.create({
      data: {
        text: "",
        authorId: userId,
        type: "EntityContent",
        parentEntityId: entityId
      }
    })
  
    revalidateTag("entities")
    revalidateTag("editsFeed:"+userId)
    return {id: entityId}
}


const recomputeEntityContributions = async (entityId: string) => {
    const entity = await getEntityById(entityId)
    
    for(let i = 0; i < entity.versions.length; i++){
        const versionContent = await getContentById(entity.versions[i].id)
        const newData = await getNewVersionContribution(entityId, versionContent.text, versionContent.author.id)
        
        await db.content.update({
            data: newData,
            where: {
                id: versionContent.id
            }
        })
    }
}


const getNewVersionContribution = async (entityId: string, text: string, userId: string, afterVersion?: number) => {
    const entity = await getEntityById(entityId)
    if(!afterVersion) afterVersion = entity.versions.length-1
    const lastVersionId = entity.versions[afterVersion].id
    const lastVersion = await getContentById(lastVersionId)

    const {charsAdded, charsDeleted} = charDiffFromJSONString(lastVersion.text, text)
    const accCharsAdded = lastVersion.accCharsAdded + charsAdded
    const contribution: [string, number][] = JSON.parse(lastVersion.contribution)
    
    let wasAuthor = false
    for(let i = 0; i < contribution.length; i++){
        if(contribution[i][0] == userId){
            wasAuthor = true
            contribution[i][1] += charsAdded
        }
    }
    if(!wasAuthor){
        contribution.push([userId, charsAdded])
    }

    return {accCharsAdded: accCharsAdded, charsAdded: charsAdded, charsDeleted: charsDeleted, contribution: JSON.stringify(contribution)}
}
  
  
export const updateEntity = async (text: string, categories: string, entityId: string, userId: string, changingContent: boolean) => {
    let references = await findReferences(text)

    const {accCharsAdded, charsAdded, charsDeleted, contribution} = await getNewVersionContribution(entityId, text, userId)
    await db.content.create({
        data: {
            text: text,
            authorId: userId,
            type: "EntityContent",
            parentEntityId: entityId,
            categories: categories,
            entityReferences: {
                connect: references
            },
            accCharsAdded: accCharsAdded,
            charsAdded: charsAdded,
            charsDeleted: charsDeleted,
            contribution: contribution
        }
    })

    revalidateTag("entity:"+entityId)
    revalidateTag("entities")
    revalidateTag("userContents:"+userId)
    revalidateTag("entityContributions:"+entityId)
    revalidateTag("editsFeed:"+userId)
    revalidateTag("entityTextLength:"+entityId)
}
  
  
export const undoChange = async (entityId: string, contentId: string, versionNumber: number, message: string) => {
    const entity = await getEntityById(entityId)
    if(entity){
      await db.content.update({
          data: {
              isUndo: true,
              undoMessage: message
          },
          where: {
            id: contentId
          }
      })
    }
  
    revalidateTag("entities")
    revalidateTag("entity:"+entityId)
}
  
  
export const deleteEntity = async (entityId: string, userId: string) => {
    await db.entity.update({
        data: {
            deleted: true,
            deletedById: userId
        },
        where: {
            id: entityId
        }
    })
  
    revalidateTag("entities")
    revalidateTag("entity:"+entityId)
}


export const deleteContent = async (contentId: string) => {
    await db.view.deleteMany({
        where: {
            contentId: contentId
        }
    })

    await db.reaction.deleteMany({
        where: {
            contentId: contentId
        }
    })

    const comments = await getContentComments(contentId)

    for(let i = 0; i < comments.length; i++){
        await deleteContent(comments[i].id)
    }

    await db.content.delete({
        where: {
            id: contentId
        }
    })
    revalidateTag("content:"+contentId)
}


export const deleteEntityHistory = async (entityId: string) => {
    const entity = await getEntityById(entityId)

    for(let i = 1; i < entity.versions.length-1; i++){
        await deleteContent(entity.versions[i].id)
    }
    
    revalidateTag("entity:"+entityId)

    await recomputeEntityContributions(entityId)
}


// TO DO: Terminar de implementar
export const renameEntity = async (entityId: string, userId: string, newName: string) => {
    const newEntityId = encodeURIComponent(newName.replaceAll(" ", "_"))
    await db.entity.update({
        data: {
            name: newName,
            id: newEntityId
        },
        where: {
            id: entityId
        }
    })
  
    revalidateTag("entities")
    revalidateTag("entity:"+entityId)
}



export const makeEntityPublic = async (entityId: string, value: boolean) => {
    await db.entity.update({
        data: {
            isPublic: value,
        },
        where: {
            id: entityId
        }
    })
  
    revalidateTag("entity:"+entityId)
}



export const getEntities = cache(async () => {
    let entities: SmallEntityProps[] = await db.entity.findMany({
        select: {
            id: true,
            name: true,
            protection: true,
            isPublic: true,
            versions: {
                select: {
                    id: true,
                    categories: true,
                    isUndo: true,
                    undoMessage: true,
                    createdAt: true
                },
                orderBy: {
                    createdAt: "asc"
                }
            },
            _count: {
                select: {
                    referencedBy: true
                }
            },
        },
        where: {
            deleted: false
        },
        orderBy: {
            name: "asc"
        }
    })
    entities = await Promise.all(entities.map(async (entity) => {
        entity.views = arraySum(await getEntityViews(entity.id))
        entity.childrenCount = await getEntityChildrenCount(entity.id)
        entity.reactions = arraySum(await getEntityReactions(entity.id))
        entity.textLength = await getEntityTextLength(entity.id)
        return entity
    }))
    return entities
}, ["entities"], {
    revalidate: 6*3600,
    tags: ["entities"]})


export async function getEntityById(id: string) {
    return unstable_cache(async () => {
        const entity: EntityProps | null = await db.entity.findUnique(
            {select: {
                id: true,
                name: true,
                protection: true,
                isPublic: true,
                deleted: true,
                versions: {
                    select: {
                        id: true,
                        categories: true,
                        isUndo: true,
                        undoMessage: true,
                        createdAt: true,
                        text: true,
                        authorId: true
                    },
                    orderBy: {
                        createdAt: "asc"
                    }
                },
                referencedBy: {
                    select: {
                        id: true,
                        createdAt: true,
                        type: true
                    }
                }
            },
                where: {
                    id: id,
                }
            }
        )
        return entity
    }, ["entity", id], {
        revalidate: 6*3600,
        tags: ["entity", "entity:"+id]})()
}


export const getCategories = cache(async () => {
    let entities = await db.content.findMany({
        distinct: ["categories"],
        select: {
            categories: true
        },
    })
    return entities.map(({categories}) => (categories))
}, ["categories"], {
    revalidate: 3600*6,
    tags: ["categories"]})


export async function getEntityContributions(id: string) {
    function editorStateFromJSON(text: string){
        let res = null
        try {
            res = JSON.parse(text)
        } catch {
    
        }
        return res
    }

    return unstable_cache(async () => {
        const entity = await getEntityById(id)
        if(!entity) return null
        if(entity.versions.length == 0) return []

        const charsContributed: Map<string, number>[] = Array.from({length: entity.versions.length}, (_, i) => new Map<string, number>())
        let prevNodes = []
        for(let i = 0; i < entity.versions.length; i++){
            const parsedVersion = editorStateFromJSON(entity.versions[i].text)
            if(!parsedVersion) continue

            const nodes = parsedVersion.root.children.map(getAllText)
            const {charsAdded, charsDeleted} = nodesCharDiff(prevNodes, nodes)

            const author = entity.versions[i].authorId
            
            if(i > 0){
                charsContributed[i] = new Map<string, number>(charsContributed[i-1])
            }

            if(charsContributed[i].has(author)){
                charsContributed[i].set(author, charsContributed[i].get(author) + charsAdded)
            } else {
                charsContributed[i].set(author, charsDeleted)
            }

            prevNodes = [...nodes]
        }
        
        return charsContributed.map((m) => Array.from(m))

    }, ["entityContributions", id], {
        revalidate: 3600*6,
        tags: ["entityContributions", "entityContributions:"+id]})()
}


export async function getEntityReactions(id: string) {
    return unstable_cache(async () => {
        const entity = await getEntityById(id)
        if(!entity) return null

        const reactions = await Promise.all(entity.versions.map(async (content) => {return await getContentReactions(content.id)}))

        return reactions
    }, ["entityReactions", id], {
        revalidate: 6*3600,
        tags: ["entityReactions", "entityReactions:"+id]})()
}


export async function getEntityViews(id: string) {
    return unstable_cache(async () => {
        const entity = await getEntityById(id)
        if(!entity) return null

        const views = await Promise.all(entity.versions.map(async (content) => {return await getContentViews(content.id)}))

        return views
    }, ["entityViews", id], {
        revalidate: 3600*6,
        tags: ["entityViews", "entityViews:"+id]})()
}


export const getUserStats = async (userId: string) => {
    return unstable_cache(async () => {
        const userContents = await getUserContents(userId)
        let entityEdits = 0
        let editedEntitiesIds = new Set()
        const postsIds = []
        
        let reactionsInPosts = 0
        let viewsInPosts = 0
        userContents.forEach((content) => {
            if(content.type == "EntityContent"){
                entityEdits ++
                if(content.parentEntityId)
                    editedEntitiesIds.add(content.parentEntityId)
            } else if(content.type == "Post"){
                postsIds.push(content.id)
                reactionsInPosts += content._count.reactions
                viewsInPosts += content._count.views
            }
        })
    
        function getAddedChars(entityContrArray: [string, number][][]){
            const lastVersion = entityContrArray[entityContrArray.length-1]
            for(let i = 0; i < lastVersion.length; i++){
                if(lastVersion[i][0] == userId){
                    return lastVersion[i][1]
                }
            }
            return 0 // esto pasa si creás la entidad y no le agregás nada
        }
    
        async function getReactionsFromFirstEdit(entityId: string){
            const reactions = await getEntityReactions(entityId)
            const entity = await getEntityById(entityId)
            return sumFromFirstEdit(reactions, entity, userId)
        }
    
        async function getViewsFromFirstEdit(entityId: string){
            const views = await getEntityViews(entityId)
            const entity = await getEntityById(entityId)
            return sumFromFirstEdit(views, entity, userId)
        }
    
        //const entityReactions = await Promise.all(Array.from(editedEntitiesIds).map(getReactionsFromFirstEdit))
        //const entityViews = await Promise.all(Array.from(editedEntitiesIds).map(getViewsFromFirstEdit))
    
        const stats: UserStats = {
            posts: postsIds.length,
            entityEdits: entityEdits,
            editedEntities: editedEntitiesIds.size,
            reactionsInPosts: reactionsInPosts,
            reactionsInEntities: 0,
            income: 0,
            entityAddedChars: 0,
            viewsInPosts: viewsInPosts,
            viewsInEntities: 0
        }
        return stats
    }, ["userStats", userId], {
        revalidate: 3600,
        tags: ["userStats", "userStats:"+userId, ""]})()
}


export const getTopKEntitiesByViews = async (k: number) => {
    
    return unstable_cache(async () => {
    const entities = await getEntities()

    function comp(a: {views?: number}, b: {views?: number}){
        return b.views - a.views
    }
    
    const sorted = entities.sort(comp)
    
    return sorted.slice(0, 3).map(({name}) => (name))
    }, ["topkentities", k.toString()], {revalidate: 3600})()
}


export async function buyAndUseSubscription(userId: string) { 
    const result = await db.subscription.create({
        data: {
            userId: userId,
            boughtByUserId: userId,
            usedAt: new Date()
        }
    })
    revalidateTag("user:"+userId)
}

export async function donateSubscriptions(n: number, userId: string) {
    const queries = []
    
    for(let i = 0; i < n; i++){
        queries.push({
            boughtByUserId: userId
        })
    }

    await db.subscription.createMany({
        data: queries
    })
    revalidateTag("user:"+userId)
    revalidateTag("poolsize")
}

export async function getDonatedSubscription(userId: string) {
    const subscription = await db.subscription.findFirst({
        where: {
            usedAt: null
        }
    })

    if(!subscription){
        return null
    } else {
        const result = await db.subscription.update({
            data: {
                usedAt: new Date(),
                userId: userId
            },
            where: {
                id: subscription.id
            }
        })
        revalidateTag("user:"+userId)
        revalidateTag("poolsize")
    }
}

export const getSubscriptionPoolSize = unstable_cache(async () => {
    const available = await db.subscription.findMany({
        select: {id: true},
        where: {usedAt: null}
    })
    return available.length
},
    ["poolsize"],
    {
        revalidate: 6*3600,
        tags: ["poolsize"]
    }
)


export async function setProtection(entityId: string, level: ProtectionLevel) {
    const result = await db.entity.update({
      where: { id: entityId },
      data: { protection: level },
    });
    revalidateTag("entities")
    revalidateTag("entity")
    return result
}
