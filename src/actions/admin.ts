'use server'

import { revalidateTag } from "next/cache";
import { db } from "../db";
import { EditorStatus } from "@prisma/client";
import { compress, decompress } from "../components/compression";
import { launchDate, subscriptionEnds, supportDid, validSubscription } from "../components/utils";
import { isSameDay } from "date-fns";
import { UserMonthDistributionProps } from "../app/lib/definitions";
import { getUser } from "./users";
import { getSessionAgent } from "./auth";



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
        if(![supportDid, "tomas", "guest"].includes(id)){
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


export async function updateProfilesFromAT(){
    const users = await db.user.findMany({
        select: {
            id: true,
            handle: true,
            displayName: true,
            description: true,
            avatar: true,
            banner: true
        }
    })

    const {agent} = await getSessionAgent()

    for(let i = 0; i < users.length; i++){
        const u = users[i]
        const {data: p} = await agent.getProfile({"actor": u.id})

        console.log("profile", p)

        if(p.avatar != u.avatar ||
            p.handle != u.handle ||
            p.displayName != u.displayName ||
            p.description != u.description ||
            p.banner != u.banner
        ) {
            console.log("Updating user", u.handle)
            console.log("Prev:")
            console.log(u.handle, u.displayName, u.description, u.avatar)
            console.log("New:")
            console.log(p.handle, p.displayName, p.description, p.avatar)

            await db.user.update({
                data: {
                    handle: p.handle,
                    displayName: p.displayName,
                    description: p.description,
                    avatar: p.avatar,
                    banner: p.banner
                },
                where: {
                    id: u.id
                }
            })
        }
    }
}