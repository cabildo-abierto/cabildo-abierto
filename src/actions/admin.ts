'use server'

import { revalidateTag } from "next/cache";
import { db } from "../db";
import { getContentById } from "./contents";
import { EditorStatus } from "@prisma/client";
import { getUser } from "./users";
import { compress, decompress } from "../components/compression";
import { getEntityById, updateEntityCurrentVersion, recomputeEntityContributions, getEntities } from "./entities";
import { launchDate, subscriptionEnds, validSubscription } from "../components/utils";
import { isSameDay } from "date-fns";
import { UserMonthDistributionProps } from "../app/lib/definitions";


export const deleteEntityHistory = async (entityId: string, includeLast: boolean) => {
    const {entity, error} = await getEntityById(entityId)
    if(error) return {error: error}

    for(let i = 1; i < entity.versions.length-(includeLast ? 0 : 1); i++){
        await deleteContent(entity.versions[i].id, true)
    }

    const {error: errorUpdate} = await updateEntityCurrentVersion(entityId)
    if(errorUpdate) return {error: errorUpdate}
    
    const {error: errorContr} = await recomputeEntityContributions(entityId)
    if(errorContr) return {error: errorContr}

    revalidateTag("entity:"+entityId)
    revalidateTag("entities")
    return {}
}


export const deleteEntity = async (entityId: string, userId: string) => {
    try {
        await db.entity.update({
            data: {
                deleted: true,
                deletedById: userId
            },
            where: {
                id: entityId
            }
        })
    } catch {
        return {error: "Error al borrar el tema."}
    }
  
    revalidateTag("entities")
    revalidateTag("entity:"+entityId)
    return {}
}


export const deleteContent = async (contentId: string, force: boolean) => {

    const {content, error} = await getContentById(contentId)
    if(error) return {error}

    if(content.childrenContents.length > 0 && !force){
        return {error: "No pudimos borrar el contenido porque tiene comentarios. Podés editarlo y borrarle el contenido."}
    }

    for(let i = 0; i < content.childrenContents.length; i++){
        await deleteContent(content.childrenContents[i].id, true)
    }

    await db.view.deleteMany({
        where: {
            contentId: contentId
        }
    })

    await db.notification.deleteMany({
        where: {
            contentId: contentId
        }
    })

    await db.noAccountVisit.deleteMany({
        where: {
            contentId: contentId
        }
    })

    await db.reaction.deleteMany({
        where: {
            contentId: contentId
        }
    })

    await db.content.delete({
        where: {
            id: contentId
        }
    })

    // habría que revalidar más tags en realidad
    revalidateTag("content:"+contentId)
    if(content.parentContents && content.parentContents.length > 0){
        revalidateTag("content:"+content.parentContents[0].id)
    }
    if(["FastPost", "Post"].includes(content.type) || (content.rootContent && ["FastPost", "Post"].includes(content.rootContent.type))){
        revalidateTag("feed")
        revalidateTag("routeFollowingFeed")
    }
    return {}
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
    
    try {
        await db.entity.update({
            data: {
                isPublic: value,
            },
            where: {
                id: entityId
            }
        })
    } catch {
        return {error: "Error al hacer pública la entidad."}
    }
  
    revalidateTag("entity:"+entityId)
    return {}
}


export async function setProtection(entityId: string, level: EditorStatus) {
    const result = await db.entity.update({
        where: { id: entityId },
        data: { protection: level },
    });
    revalidateTag("entities")
    revalidateTag("entity")
    return result
}


export async function revalidateEntities(){
    revalidateTag("entity")
    revalidateTag("entities")
}

export async function revalidateContents(){
    revalidateTag("content")
}

export async function revalidateNotifications(){
    revalidateTag("notifications")
}

export async function revalidateUsers(){
    revalidateTag("user")
    revalidateTag("users")
    revalidateTag("userStats")
    revalidateTag("usersWithStats")
}

export async function revalidateFeed(){
    revalidateTag("feed")
    revalidateTag("routeFollowingFeed")
    revalidateTag("repliesFeed")
    revalidateTag("editsFeed")
    revalidateTag("profileFeed")
}


export async function revalidateDrafts(){
    revalidateTag("drafts")
}


export async function revalidateSearchkeys(){
    revalidateTag("searchkeys")
}


export async function revalidateSuggestions(){
    revalidateTag("followSuggestions")
}


export async function recomputeAllContributions(){
    const {entities} = await getEntities()

    for(let i = 0; i < entities.length; i++){
        console.log("recomputing contributions for", entities[i].name)
        const t1 = Date.now()
        const {error} = await recomputeEntityContributions(entities[i].id)
        if(error){
            console.log("error", error)
        }
        console.log("Done in ", Date.now()-t1)
    }
}


export async function updateUniqueViewsCount(){
    const entities = await db.entity.findMany({
        select: {
            id: true,
            views: true
        },
        where: {
            uniqueViewsCount: null
        }
    })
    for(let i = 0; i < entities.length; i++){
        const s = new Set(entities[i].views.map((v) => (v.userById))).size
        await db.entity.update({
            data: {
                uniqueViewsCount: s
            },
            where: {
                id: entities[i].id
            }
        })
    }
}


export async function updateIsDraft(){
    const contents = await db.content.findMany({
        select: {
            id: true,
            isDraft: true
        }
    })
    for(let i = 0; i < contents.length; i++){
        if(contents[i].isDraft == null){
            console.log("updating", i)
            await db.content.update({
                data: {
                    isDraft: false
                },
                where: {
                    id: contents[i].id
                }
            })
        }
    }
}


export async function compressContents(){
    const contents = await db.content.findMany({
        select: {
            id: true,
            text: true,
            plainText: true
        }
    })
    console.log("got the contents")
    for(let i = 0; i < contents.length; i++){
        console.log("updating content", i)
        const c = contents[i]
        try {
            const compressedText = compress(c.text)
            const compressedPlainText = compress(c.plainText)
            await db.content.update({
                data: {
                    compressedText: compressedText,
                    compressedPlainText: compressedPlainText
                },
                where: {
                    id: c.id
                }
            })
        } catch {
            console.log("couldn't compress", c.id)
        }
    }
}


export async function compressContent(id: string){
    const c = await db.content.findUnique({
        select: {
            id: true,
            text: true,
            plainText: true
        },
        where: {
            id: id
        }
    })
    const t1 = Date.now()
    const compressedText = compress(c.text)
    const t2 = Date.now()

    console.log("compression time", t2-t1)
    //const compressedPlainText = compress(compress(c.plainText))

    const t3 = Date.now()
    const decompressedText = decompress(compressedText)
    const t4 = Date.now()

    console.log("decompression time", t4-t3)

    console.log("equal", decompressedText == c.text)
    console.log("lengths", decompressedText.length, c.text.length)
    console.log("compressed length", compressedText.length)

    console.log("plain text length", c.plainText.length)
    /*await db.content.update({
        data: {
            compressedText: compressedText,
            compressedPlainText: compressedPlainText
        },
        where: {
            id: c.id
        }
    })*/
}


export async function decompressContents(){
    const contents = await db.content.findMany({
        select: {
            id: true,
            text: true,
            plainText: true,
            compressedText: true,
            compressedPlainText: true
        },
        where: {
            numWords: {
                lte: 30
            }
        }
    })
    console.log("got the contents")
    for(let i = 0; i < contents.length; i++){
        console.log("updating content", i)
        const c = contents[i]
        console.log("plain text", c.plainText)
        if(c.plainText != null && c.plainText.length > 0) continue
        try {
            const decompressedText = decompress(c.compressedText)
            const decompressedPlainText = decompress(c.compressedPlainText)
            await db.content.update({
                data: {
                    text: decompressedText,
                    plainText: decompressedPlainText
                },
                where: {
                    id: c.id
                }
            })
        } catch {
            console.log("couldn't decompress", c.id)
        }
    }
}


export async function decompressContent(contentId: string){
    const c = await db.content.findUnique({
        select: {
            id: true,
            text: true,
            plainText: true,
            compressedText: true,
            compressedPlainText: true
        },
        where: {
            id: contentId
        }
    })
    try {
        const decompressedText = decompress(c.compressedText)
        const decompressedPlainText = decompress(c.compressedPlainText)
        await db.content.update({
            data: {
                text: decompressedText,
                plainText: decompressedPlainText
            },
            where: {
                id: c.id
            }
        })
    } catch {
        console.log("couldn't decompress", c.id)
    }
}


export async function takeAuthorship(contentId: string) {
    const {content, error} = await getContentById(contentId)
    if(error) return {error}
    
    const {user, error: userError} = await getUser()
    if(userError) return {error: userError}

    if(!user || (user.editorStatus != "Administrator" && user.id != "tomas") || user.id == content.author.id){
        return {error: "No tenés los permisos suficientes para hacer esto."}
    }

    try {
        await db.content.update({
            data: {
                authorId: user.id
            },
            where: {
                id: contentId
            }
        })
    } catch {
        return {error: "Error al actualizar la autoría."}
    }

    revalidateTag("content:"+contentId)
    revalidateTag("repliesFeed:"+user.id)
    revalidateTag("repliesFeed:"+content.author.id)
    revalidateTag("profileFeed:"+user.id)
    revalidateTag("profileFeed:"+content.author.id)
    revalidateTag("editsFeed:"+user.id)
    revalidateTag("editsFeed:"+content.author.id)
    if(content.parentEntityId){
        revalidateTag("entity:"+content.parentEntityId)
    }
    
    return {}
}




export async function computeSubscriptorsByDay(minPrice: number) {
    const s = await db.subscription.findMany({
        select: {
            usedAt: true,
            endsAt: true,
            userId: true,
        },
        where: {
            usedAt: {
                not: null
            },
            price: {
                gte: minPrice
            }
        }
    })
    const accounts = await db.user.findMany({
        select: {
            id: true,
            subscriptionsUsed: true,
            _count: {
                select: {
                    contents: {
                        where: {
                            isDraft: false
                        }
                    },
                    subscriptionsBought: {
                        where: {
                            price: {
                                gte: 500
                            }
                        }
                    }
                }
            }
        }
    })

    const dayMillis = 24*60*60*1000
    let day = new Date(new Date().getTime() - dayMillis*7)
    const tomorrow = new Date(new Date().getTime() + dayMillis)
    
    let allUsers = new Set()
    while(day < tomorrow){

        let users = new Set()
        let newUsers = new Set()
        for(let i = 0; i < s.length; i++){
            if(s[i].endsAt >= day && s[i].usedAt <= day){
                users.add(s[i].userId)
                if(!allUsers.has(s[i].userId)){
                    newUsers.add(s[i].userId)
                    allUsers.add(s[i].userId)
                }
            }
        }

        console.log(day.getDate(), "/", day.getMonth()+1, "-->", Array.from(newUsers), newUsers.size, users.size)

        day.setTime(day.getTime()+dayMillis)
    }

    function comp(a, b){
        return a.bought - b.bought
    }

    const printableAccounts = accounts.map((a) => ({id: a.id, contents: a._count.contents, bought: a._count.subscriptionsBought}))

    printableAccounts.sort(comp)

    console.log("all accounts", printableAccounts, accounts.length)

    const unsubscribedAccounts = []
    for(let i = 0; i < accounts.length; i++){
        if(!validSubscription(accounts[i])){
            unsubscribedAccounts.push(accounts[i].id)
        }
    }

    const allSubscriptions = await db.subscription.findMany({
        select: {
            id: true
        },
        where: {
            price: {
                gte: minPrice
            }
        }
    })

    console.log("suscripciones vendidas totales", allSubscriptions.length)
}


export async function computeDayViews(entities: boolean = false){
    let views = await db.view.findMany({
        select: {
            createdAt: true,
            userById: true,
            contentId: true,
            entityId: true
        },
    })
    if(entities){
        views = views.filter((v) => (v.entityId != null))
    }

    const dayMillis = 24*60*60*1000
    let day = new Date(new Date().getTime() - dayMillis*7)
    const tomorrow = new Date(new Date().getTime() + dayMillis)
    
    while(day < tomorrow){

        let usersViews = new Map<string, number>()
        for(let i = 0; i < views.length; i++){
            if(isSameDay(views[i].createdAt, day)){
                if(!usersViews.has(views[i].userById)){
                    usersViews.set(views[i].userById, 1)
                } else {
                    usersViews.set(views[i].userById, usersViews.get(views[i].userById)+1)
                }
            }
        }

        console.log(day.getDate(), "/", day.getMonth()+1, "-->", Array.from(usersViews), usersViews.size)

        day.setTime(day.getTime()+dayMillis)
    }
}


export async function getAdminStats(){

    const accounts = await db.user.findMany({
        select: {
            id: true,
            subscriptionsUsed: {
                orderBy: {
                    endsAt: "asc"
                }
            },
            createdAt: true,
            views: {
                select: {
                    createdAt: true
                }
            },
            _count: {
                select: {
                    contents: {
                        where: {
                            isDraft: false
                        }
                    },
                    subscriptionsBought: {
                        where: {
                            price: {
                                gte: 500
                            }
                        }
                    }
                }
            }
        }
    })

    const reactions = await db.reaction.findMany({
        select: {
            createdAt: true
        }
    })

    const contents = await db.content.findMany({
        select: {
            createdAt: true
        }
    })

    const subscriptions = await db.subscription.findMany({
        select: {
            usedAt: true,
            endsAt: true,
            userId: true
        }
    })

    const sellsByPrice = await db.subscription.groupBy({
        by: ['price'],
        _count: {
          price: true,
        },
        where: {
            price: {
                gte: 500
            }
        }
    });

    const dayDuration = 60*60*24*1000

    let viewsByDay = []
    for(let i = 0; i < 100; i++) viewsByDay.push(0)

    accounts.forEach(({id, views, createdAt}) => {
        if(!["soporte", "tomas", "guest"].includes(id)){
            views.forEach((v) => {
                const time =  Math.floor((v.createdAt.getTime() - createdAt.getTime()) / dayDuration)
                if(time < 100){
                    viewsByDay[time] ++
                }
            })
        }
    })
    
    const firstMonday = new Date(launchDate);
    firstMonday.setDate(firstMonday.getDate() - ((firstMonday.getDay() + 6) % 7));

    const currentDate = new Date();
    const weekDuration = 7 * dayDuration;


    let eventsByWeek: {date: Date, accounts: number, reactions: number, contents: number}[] = []
    for (let date = firstMonday; date <= currentDate; date = new Date(date.getTime() + weekDuration)) {

        let users = new Set()

        accounts.forEach((s) => {
            if(s.createdAt <= date)
                users.add(s.id)
        })

        const weekEnd = new Date(date.getTime() + weekDuration)

        let weekReactions = new Set()
        reactions.forEach((r) => {
            if(r.createdAt >= date && r.createdAt < weekEnd)
                weekReactions.add(r.createdAt)
        })


        let weekContents = new Set()
        contents.forEach((c) => {
            if(c.createdAt >= date && c.createdAt < weekEnd)
                weekContents.add(c.createdAt)
        })

        eventsByWeek.push({ date, accounts: users.size, reactions: weekReactions.size, contents: weekContents.size });
    }

    const today = new Date()
    const subscriptors = new Set()
    subscriptions.forEach((s) => {
        if(s.usedAt && s.usedAt < today && s.endsAt >= today){
            subscriptors.add(s.userId)
        }
    })

    const unrenewed = new Set()

    accounts.forEach((a) => {
        if(a.subscriptionsUsed.length > 0 && !validSubscription(a)){
            unrenewed.add(a.id)
        }
    })


    const contentsByUser = await db.content.groupBy({
        by: ['authorId'],
        _count: {
          authorId: true,
        },
        where: {
            isDraft: false
        }
    });

    return {
        accounts: accounts.length,
        sellsByPrice,
        viewsByDay,
        eventsByWeek,
        unrenewed,
        contentsByUser,
        lastAccounts: accounts.sort((a, b) => (b.createdAt.getTime() - a.createdAt.getTime())).slice(0, 5)
    }
}


export async function getPaymentsStats(){
    const accounts = await db.user.findMany({
        select: {
            id: true,
            subscriptionsUsed: true,
            createdAt: true,
            paymentPromises: {
                select: {
                    amount: true,
                    contentId: true,
                    status: true,
                    subscription: {
                        select: {
                            userId: true
                        }
                    }
                }
            },
            views: {
                select: {
                    id: true,
                    createdAt: true,
                    content: {
                        select: {
                            parentEntity: {
                                select: {
                                    versions: {
                                        select: {
                                            authorId: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                where: {
                    createdAt: {
                        gte: launchDate
                    },
                    content: {
                        type: "EntityContent"
                    }
                }
            },
            reactions: {
                select: {
                    id: true,
                    createdAt: true
                },
                where: {
                    createdAt: {
                        gte: launchDate
                    },
                    content: {
                        type: "Post"
                    }
                }
            }
        },
        where: {
            id: {
                notIn: ["soporte", "guest"]
            }
        }
    })

    const userMonths: UserMonthDistributionProps[] = []

    accounts.forEach((a, index) => {
        const launch = launchDate
        let date = launch > a.createdAt ? launch : a.createdAt
        let monthEnds = [date]
        const today = new Date()
        while(date < today){
            date = subscriptionEnds(date)
            if(date < today)
                monthEnds.push(date)
        }

        for(let i = 1; i < monthEnds.length; i++){
            const start = monthEnds[i-1]
            const end = monthEnds[i]

            const viewsOnMonth: {createdAt: Date, id: string}[] = []
            a.views.forEach((v) => {
                if(v.createdAt < end && v.createdAt >= start){
                    const versions = v.content.parentEntity.versions
                    if(!versions.some((v) => (v.authorId == a.id))){
                        viewsOnMonth.push(v)
                    }
                }
            })

            const reactionsOnMonth: {createdAt: Date, id: string}[] = []
            a.reactions.forEach((r) => {
                if(r.createdAt < end && r.createdAt >= start){
                    reactionsOnMonth.push(r)
                }
            })
            
            userMonths.push({
                userId: a.id,
                reactions: reactionsOnMonth,
                views: viewsOnMonth,
                start: start,
                end: end
            })
        }
    })

    const entities = await db.entity.findMany({
        select: {
            id: true,
            name: true,
            versions: {
                select: {
                    contribution: true,
                    editPermission: true,
                    charsAdded: true,
                    author: {
                        select: {
                            id: true
                        }
                    },
                    undos: {
                        select: {
                            id: true
                        }
                    },
                    rejectedById: true,
                    confirmedById: true,
                    claimsAuthorship: true
                },
                orderBy: {
                    createdAt: "desc"
                },
                where: {
                    type: "EntityContent"
                }
            }
        }
    })

    return {userMonths, entities, accounts}
}