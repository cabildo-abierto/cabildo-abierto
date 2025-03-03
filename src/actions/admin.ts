'use server'

import { revalidateTag } from "next/cache";
import { db } from "../db";
import {getRkeyFromUri, launchDate, supportDid, validSubscription} from "../components/utils/utils";
import { getSessionAgent } from "./auth";
import {deleteRecords} from "./atproto-update";

export async function revalidateTags(tags: string[]){
    for(let i = 0; i < tags.length; i++){
        revalidateTag(tags[i])
    }
}

export async function revalidateEverything(){
    await revalidateTags([
        "feedCA",
        "thread",
        "user",
        "dataset",
        "visualization",
        "tt",
        "fundingPercentage",
        "categories",
        "blobs",
        "conversations",
        "chats",
        "interactions",
        "topics"
    ])
}

/*export async function getPaymentsStats(){
    const accounts = await db.user.findMany({
        select: {
            did: true,
            subscriptionsUsed: true,
            createdAt: true,
            paymentPromises: {
                select: {
                    amount: true,
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
                    if(!versions.some((v) => (v.authorId == a.did))){
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
                userId: a.did,
                reactions: reactionsOnMonth,
                views: viewsOnMonth,
                start: start,
                end: end
            })
        }
    })

    const entities = await db.topic.findMany({
        select: {
            id: true,
            versions: {
                select: {
                    title: true,
                    contribution: true,
                    charsAdded: true,
                    author: {
                        select: {
                            did: true
                        }
                    },
                },
                orderBy: {
                    createdAt: "desc"
                },
            }
        }
    })

    return {userMonths, entities, accounts}
}*/


export async function getAdminStats(){

    const accounts = await db.user.findMany({
        select: {
            did: true,
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

    accounts.forEach(({did, views, createdAt}) => {
        if(![supportDid, "tomas", "guest"].includes(did)){
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


    let eventsByWeek: {date: Date, accounts: number}[] = []
    for (let date = firstMonday; date <= currentDate; date = new Date(date.getTime() + weekDuration)) {

        let users = new Set()

        accounts.forEach((s) => {
            if(s.createdAt <= date)
                users.add(s.did)
        })

        const weekEnd = new Date(date.getTime() + weekDuration)

        eventsByWeek.push({ date, accounts: users.size });
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
            unrenewed.add(a.did)
        }
    })

    return {
        accounts: accounts.length,
        sellsByPrice,
        viewsByDay,
        eventsByWeek,
        unrenewed,
        lastAccounts: accounts.sort((a, b) => (b.createdAt.getTime() - a.createdAt.getTime())).slice(0, 5)
    }
}


export async function setRkeys(){
    const records = await db.record.findMany({
        select: {
            cid: true,
            uri: true,
            rkey: true
        },
        where: {
            rkey: "no key"
        }
    })
    for(let i = 0; i < records.length; i++){
        const r = records[i]
        await db.record.update({
            data: {
                rkey: getRkeyFromUri(r.uri)
            },
            where: {
                uri: r.uri
            }
        })
    }
}


export async function updateRecord(){
    const {agent} = await getSessionAgent()

    await agent.com.atproto.repo.putRecord()
}


export async function deleteUser(userId: string) {
    await deleteRecords({author: userId, atproto: false})
    await db.user.deleteMany({
        where: {
            OR: [
                {
                    did: userId
                },
                {
                    handle: userId
                }
            ]
        }
    })
}