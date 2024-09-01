'use server'

import { cache } from "./cache";
import { revalidateTag, unstable_cache } from "next/cache";
import { ContentType } from "@prisma/client";
import { db } from "../db";
import { createClient } from "../utils/supabase/server";
import { ContentProps, EntityProps } from "src/app/lib/definitions";


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
    console.log("getting entity comments", id)
    return unstable_cache(async () => {
        let versions = (await getEntityById(id)).versions
        let comments = []
        for(let i = 0; i < versions.length; i++){
            const versionComments = await getContentComments(versions[i].id)
            comments = [...comments, ...versionComments]
        }
        console.log("result", comments)
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
        console.log("revalidating comments of", parentEntityId)
        revalidateTag("comments:"+parentEntityId)
    } else {
        console.log("parent entity id is", parentEntityId)
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
    const userAuthId = await getUserAuthId()
    if(!userAuthId) return undefined

    const userId = await getUserIdByAuthId(userAuthId)
    if(!userId) return undefined

    return await getUserById(userId)
}


export async function getUserAuthId() {

    const supabase = createClient()
    const {data} = await supabase.auth.getUser()

    const userId = data?.user?.id

    return userId
}


export const addLike = async (id: string, userId: string) => {
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
    const likeCount = await getContentReactions(id)
    return [true, likeCount]
}


export const removeLike = async (id: string, userId: string) => {
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
    const likeCount = await getContentReactions(id)
    return [false, likeCount]
}


export const addView = async (id: string, userId: string) => {
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
        });
        revalidateTag("views:"+id)
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
  
  
export const updateEntity = async (text: string, categories: string, entityId: string, userId: string) => {
    await db.content.create({
        data: {
            text: text,
            authorId: userId,
            type: "EntityContent",
            parentEntityId: entityId,
            categories: categories
        }
    })

    revalidateTag("entity:"+entityId)
    revalidateTag("entities")
}
  
  
export const undoChange = async (entityId: string, contentId: string, versionNumber: number, message: string) => {
    const entity = await getEntityById(entityId)
    if(entity && entity.versions.length-1 == versionNumber){
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
                        createdAt: true
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