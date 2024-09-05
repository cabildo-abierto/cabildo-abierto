'use server'

import { cache } from "./cache";
import { revalidateTag, unstable_cache } from "next/cache";
import { ContentType } from "@prisma/client";
import { db } from "../db";
import { createClient } from "../utils/supabase/server";
import { ContentProps, EntityProps, UserStats } from "src/app/lib/definitions";
import { nodesCharDiff } from "src/components/diff";
import { arraySum, sumFromFirstEdit } from "src/components/utils";


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
                parentEntityId: true
            },
            where: {
                id: id,
            }
        })
        return content ? content : undefined
    }, ["content", id], {tags: ["content", "content:"+id]})()
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
    }, ["comments", id], {tags: ["comments", "comments:"+id]})()
}


export async function getEntityComments(id: string) {
    return unstable_cache(async () => {
        let versions = (await getEntityById(id)).versions
        let comments = []
        for(let i = 0; i < versions.length; i++){
            const versionComments = await getContentComments(versions[i].id)
            comments = [...comments, ...versionComments]
        }
        return comments
    }, ["comments", id], {tags: ["comments", "comments:"+id]})()
}


export const getFeed = unstable_cache(async () => {
    let feed = await db.content.findMany({
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
                {isDraft: false}
            ]
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
    return feed
}, ["feed"], {tags: ["feed"]})


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
    }, ["drafts", userId], {tags: ["drafts", "drafts:"+userId]})() 
}


export const getProfileFeed = (userId: string) => {
    return unstable_cache(async () => {
        const feed = await db.content.findMany({
            select: {
                id: true,
                type: true,
                text: true,
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
    }, ["profileFeed", userId], {tags: ["profileFeed", "profileFeed:"+userId]})()  
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
    }, ["followingFeed", userId], {tags: ["followingFeed", "followingFeed:"+userId]})()    
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
    }, ["views", contentId], {tags: ["views", "views:"+contentId]})()    
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
    }, ["fake-news", contentId], {tags: ["fake-news", "views:"+contentId]})()    
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
    }, ["reactions", contentId], {tags: ["reactions", "reactions:"+contentId]})()    
}


export const userLikesContent = (contentId: string, userId: string) => {
    return unstable_cache(async () => {
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
    }, ["userLikesContent", contentId, userId], {tags: ["userLikesContent", "userLikesContent:"+contentId+":"+userId]})()    
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
    }
    revalidateTag("comments:"+parentContentId)
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
        tags: ["users"]
    }
)


export const getUsersWithStats = unstable_cache(async () => {
    const users = await getUsers()

    return await Promise.all(users.map(async (user) => (
                {
                    user: user,
                    stats: await getUserStats(user.id)
                }
            )
        )
    )
},
    ["usersWithStats"],
    {
        revalidate: 10,
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
    }, ["user", userId], {tags: ["user:"+userId]})()    
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
                            parentEntityId: true
                        },
                        where: {
                            type: {
                                in: ["Post", "EntityContent"]
                            }
                        },
                        orderBy: {
                            createdAt: "desc"
                        }
                    },
                },
                where: {
                    id: userId
                }
            }
        )).contents

        return contents ? contents : undefined
    }, ["userContents", userId], {tags: ["userContents:"+userId]})()    
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
    }, ["userIdByAuthId", authId], {tags: ["userIdByAuthId", "userIdByAuthId:"+authId]})()    
}


export async function getUser() {
    const userId = await getUserId()
    if(!userId) return undefined

    return await getUserById(userId)
}


export async function getUserId() {
    const userAuthId = await getUserAuthId()
    if(!userAuthId) return undefined

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
            userById: userId,
            contentId: id
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
    return {id: entityId}
}
  
  
export const updateEntity = async (text: string, categories: string, entityId: string, userId: string, changingContent: boolean) => {
    let references = await findReferences(text)

    await db.content.create({
        data: {
            text: text,
            authorId: userId,
            type: "EntityContent",
            parentEntityId: entityId,
            categories: categories,
            entityReferences: {
                connect: references
            }
        }
    })

    revalidateTag("entity:"+entityId)
    revalidateTag("entities")
    revalidateTag("userContents:"+userId)
    revalidateTag("entityContributions:"+entityId)
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


export const getEntities = cache(async () => {
    let entities = await db.entity.findMany({
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
            NOT: {
                deleted: true
            }
        },
        orderBy: {
            name: "asc"
        }
    })
    return entities
}, ["entities"], {tags: ["entities"]})


export async function getEntityById(id: string) {
    return unstable_cache(async () => {
        const entity: EntityProps | null = await db.entity.findUnique(
            {select: {
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
    }, ["entity", id], {tags: ["entity", "entity:"+id]})()
}


export const getCategories = cache(async () => {
    let entities = await db.content.findMany({
        distinct: ["categories"],
        select: {
            categories: true
        },
    })
    return entities.map(({categories}) => (categories))
}, ["categories"], {tags: ["categories"]})


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

        const charsContributed: Map<string, number>[] = Array.from({length: entity.versions.length}, (_, i) => new Map<string, number>())
        let prevNodes = []
        for(let i = 0; i < entity.versions.length; i++){
            const parsedVersion = editorStateFromJSON(entity.versions[i].text)
            if(!parsedVersion) continue

            const nodes = parsedVersion.root.children
            const {newChars} = nodesCharDiff(prevNodes, nodes)

            const author = entity.versions[i].authorId
            
            if(i > 0){
                charsContributed[i] = new Map<string, number>(charsContributed[i-1])
            }

            if(charsContributed[i].has(author)){
                charsContributed[i].set(author, charsContributed[i].get(author) + newChars)
            } else {
                charsContributed[i].set(author, newChars)
            }

            prevNodes = [...nodes]
        }
        
        return charsContributed.map((m) => Array.from(m))

    }, ["entityContributions", id], {tags: ["entityContributions", "entityContributions:"+id]})()
}


export async function getEntityReactions(id: string) {
    return unstable_cache(async () => {
        const entity = await getEntityById(id)
        if(!entity) return null

        const reactions = await Promise.all(entity.versions.map(async (content) => {return await getContentReactions(content.id)}))

        return reactions
    }, ["entityReactions", id], {tags: ["entityReactions", "entityReactions:"+id]})()
}


export async function getEntityViews(id: string) {
    return unstable_cache(async () => {
        const entity = await getEntityById(id)
        if(!entity) return null

        const views = await Promise.all(entity.versions.map(async (content) => {return await getContentViews(content.id)}))

        return views
    }, ["entityViews", id], {tags: ["entityViews", "entityViews:"+id]})()
}


export async function getUserStats(userId: string) {
    const userContents = await getUserContents(userId)
    let entityEdits = 0
    let editedEntitiesIds = new Set()
    const postsIds = []

    userContents.forEach((content) => {
        if(content.type == "EntityContent"){
            entityEdits ++
            if(content.parentEntityId)
                editedEntitiesIds.add(content.parentEntityId)
        } else if(content.type == "Post"){
            postsIds.push(content.id)
        }
    })

    const postReactions = await Promise.all(postsIds.map(getContentReactions))
    const entityContributions = await Promise.all(Array.from(editedEntitiesIds).map(getEntityContributions))

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

    const entityReactions = await Promise.all(Array.from(editedEntitiesIds).map(getReactionsFromFirstEdit))
    
    const postViews = await Promise.all(postsIds.map(getContentViews))
    const entityViews = await Promise.all(Array.from(editedEntitiesIds).map(getViewsFromFirstEdit))

    const stats: UserStats = {
        posts: postsIds.length,
        entityEdits: entityEdits,
        editedEntities: editedEntitiesIds.size,
        reactionsInPosts: arraySum(postReactions),
        reactionsInEntities: arraySum(entityReactions),
        income: 0,
        entityAddedChars: arraySum(entityContributions.map(getAddedChars)),
        viewsInPosts: arraySum(postViews),
        viewsInEntities: arraySum(entityViews)
    }
    return stats
}


export const getTopKEntitiesByViews = async (k: number) => {
    
    return unstable_cache(async () => {
    const entities = await getEntities()
    const views = await Promise.all(entities.map(async ({id}) => {return arraySum(await getEntityViews(id))}))
    
    function comp(a: {views: number}, b: {views: number}){
        return b.views - a.views
    }
    
    const sorted = entities.map(({name}, index) => ({name: name, views: views[index]})).sort(comp)
    
    return sorted.slice(0, 3).map(({name}) => (name))
    }, ["topkentities", k.toString()], {revalidate: 3600})()
}