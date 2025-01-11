'use server'


import { accessToken } from "../components/utils";
import { pathLogo } from "../components/logo";
import MercadoPagoConfig, { Preference } from "mercadopago";


const baseUrl = "https://www.cabildoabierto.com.ar"
//const baseUrl = "localhost:3000"

export async function createPreference(userId: string, amount: number) {
    const client = new MercadoPagoConfig({ accessToken: accessToken });
    const preference = new Preference(client);

    const title = "Aporte de $" + amount + " a Cabildo Abierto"

    let items = [{
        picture_url: baseUrl+pathLogo,
        id: "0",
        title: title,
        quantity: 1,
        unit_price: amount,
        currencyId: "ARS"
    }]

    try {
        const result = await preference.create({
            body: {
              back_urls: {
                  success: baseUrl+"/aportar/pago-exitoso",
                  pending: baseUrl+"/aportar/pago-pendiente",
                  failure: baseUrl+"/aportar/pago-fallido"
              },
              notification_url: baseUrl+"/api/pago?source_news=webhooks",
              items: items,
              metadata: {
                  user_id: userId,
                  donatedAmount: amount,
              },
              payment_methods: {
                  excluded_payment_types: [
                      {id: "ticket"}
                  ]
              }
            }
        })
        return {id: result.id}
    } catch {
        return {error: "Ocurrió un error al iniciar el pago."}
    }
}



export async function getSubscriptionPrice() {
    return {price: 500}
}


export async function getContentContribution(id: string): Promise<{contribution: string}>{
    throw Error("Not implemented.")
}


/*export async function createPaymentPromisesForEntityView(view: {content: {id: string, authorId: string, createdAt: Date}}, viewValue: number, subscriptionId: string){

    const {contribution} = await getContentContribution(view.content.id)
    
    const bothContributions: BothContributionsProps = JSON.parse(contribution)
    const contributions = contributionsToProportionsMap(bothContributions, view.content.authorId)

    const authors = Object.keys(contributions)

    for(let i = 0; i < authors.length; i++){
        console.log("creating promise for", authors[i], "with contribution", contributions[authors[i]], "and value", viewValue)
        await db.paymentPromise.create({
            data: {
                authorId: authors[i],
                subscriptionId: subscriptionId,
                contentId: view.content.id,
                amount: viewValue * contributions[authors[i]]
            }
        })
    }

    return {}
}*/


/*export async function createPaymentPromisesForEntityViews(user: UserProps, amount: number, start: Date, end: Date, subscriptionId: string){
    let entityViews = await db.view.findMany({
        select: {
            content: {
                select: {
                    id: true,
                    authorId: true,
                    createdAt: true,
                    parentEntity: {
                        select: {
                            id: true,
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
            userById: user.did,
            content: {
                type: "EntityContent",
                parentEntity: {
                    deleted: false
                }
            },
            AND: [
                {
                    createdAt: {
                        gte: start
                    }
                },
                {
                    createdAt: {
                        lt: end
                    }
                }
            ],
        }
    })

    function notEntityAuthor(e){
        return !e.content.parentEntity.versions.some((v) => (v.authorId == user.did))
    }

    entityViews = entityViews.filter(notEntityAuthor)

    if(entityViews.length == 0) return false
    const viewValue = amount / entityViews.length

    for(let i = 0; i < entityViews.length; i++){
        const view = entityViews[i]
        await createPaymentPromisesForEntityView(view, viewValue, subscriptionId)
    }
    return true
}*/


/*export async function createPaymentPromisesForContentReactions(user: UserProps, amount: number, start: Date, end: Date, subscriptionId: string){
    const contentReactions = await db.reaction.findMany({
        select: {
            content: {
                select: {
                    id: true,
                    authorId: true,
                    createdAt: true
                }
            }
        },
        where: {
            userById: user.did,
            content: {
                type: "Post"
            },
            createdAt: {
                gte: start
            }
        }
    })

    if(contentReactions.length == 0){
        return false
    }
    const reactionValue = amount / contentReactions.length

    for(let i = 0; i < contentReactions.length; i++){
        const reaction = contentReactions[i]
        console.log("creating payment promise for post reaction", reaction.content.id, "with value", reactionValue, "and author", reaction.content.authorId)
        await db.paymentPromise.create({
            data: {
                authorId: reaction.content.authorId,
                subscriptionId: subscriptionId,
                contentId: reaction.content.id,
                amount: reactionValue
            }
        })
    }
    return true
}*/


/*export async function createPromises(userId: string, amount: number, start: Date, end: Date, subscriptionId: string){
    const {user, error} = await getUserById(userId)
    if(error) return {error}

    console.log("creating promises by user", userId, "with total value", amount, "between", start, "and", end)

    const foundEntityViews = await createPaymentPromisesForEntityViews(user, amount*0.5, start, end, subscriptionId)
    
    const foundReactions = await createPaymentPromisesForContentReactions(user, amount*0.5, start, end, subscriptionId)

    if(!foundEntityViews){
        await createPaymentPromisesForContentReactions(user, amount*0.5, start, end, subscriptionId)
    }

    if(!foundReactions){
        await createPaymentPromisesForEntityViews(user, amount*0.5, start, end, subscriptionId)
    }

    if(foundReactions || foundEntityViews){
        console.log("assigning subscription")
        await db.subscription.update({
            data: {
                usedAt: start,
                endsAt: end,
                userId: userId,
            },
            where: {
                id: subscriptionId
            }
        })
    } else {
        console.log("creating no activity subscription")
        await db.subscription.create({
            data: {
                boughtByUserId: supportDid,
                price: 0,
                paymentId: "no activity",
                userId: userId,
                usedAt: start,
                endsAt: end
            }
        })
    }


    return {}
}*/


/*export async function reassignPromise(p: {id: string, amount: number, subscription: SubscriptionProps}) {
    await db.paymentPromise.update({
        data: {
            status: "Canceled"
        },
        where: {
            id: p.id
        }
    })
    // TO DO: Implement
}*/


/*function confirmWaitPassed(content: {createdAt: Date, undos: {createdAt: Date}[], type: ContentType}){
    const now = new Date()
    let lastUpdateDate = content.createdAt
    if(content.type == "EntityContent"){
        lastUpdateDate = content.createdAt
        content.undos.forEach((u) => {
            if(u.createdAt > lastUpdateDate) lastUpdateDate = u.createdAt
        })
    }
    return now.getTime() - lastUpdateDate.getTime() > 1000*30*24*60*60
}*/


export async function confirmPayments() {
    return
    /*const promises = await db.paymentPromise.findMany({
        select: {
            id: true,
            amount: true,
            subscription: true,
            content: {
                select: {
                    type: true,
                    undos: {
                        select: {
                            id: true,
                            createdAt: true
                        }
                    },
                    claimsAuthorship: true,
                    rejectedById: true,
                    charsAdded: true,
                    confirmedById: true,
                    editPermission: true,
                    parentEntityId: true,
                    createdAt: true
                }
            }
        },
        where: {
            status: "Pending"
        }
    })

    console.log("unconfirmed promises found", promises.length)

    let totalConfirmed = 0
    let totalAmount = 0
    for(let i = 0; i < promises.length; i++){
        const p = promises[i]
        if(confirmWaitPassed(promises[i].content)){
            if(p.content.type == "EntityContent" && !isPartOfContent(p.content)){
                console.log("reasignando promesa")
                console.log(p)
                //await reassignPromise(p)
            } else {
                console.log("confirmando promesa", i)
                await db.paymentPromise.update({
                    data: {
                        status: "Confirmed"
                    },
                    where: {
                        id: p.id
                    }
                })
                totalConfirmed ++
                totalAmount += p.amount
            }
        }
    }
    console.log("Promsesas confirmadas", totalConfirmed)
    console.log("Pagos totales", totalAmount)
     */
}


export async function createPaymentPromises(){
    return
    /*
    let subscriptions = await db.subscription.findMany({
        select: {
            paymentPromises: {
                select: {
                    id: true
                }
            },
            price: true,
            id: true
        },
        where: {
            userId: null
        }
    })

    subscriptions = subscriptions.filter((s) => (s.paymentPromises.length == 0))

    if(subscriptions.length == 0){
        return
    }

    console.log("Subscriptions available", subscriptions.length)

    let users = await db.user.findMany({
        select: {
            did: true,
            subscriptionsUsed: {
                select: {
                    id: true,
                    usedAt: true,
                    endsAt: true
                }
            },
            createdAt: true
        }
    })

    let j = 0
    for(let i = 0; i < users.length; i++){
        if(j >= subscriptions.length) {
            console.log("Ran out of subscriptions")
            break
        }
        const subscription = subscriptions[j]
        const userId = users[i].did

        const creation = users[i].createdAt > launchDate ? users[i].createdAt : launchDate

        const nextSubscriptionStart = users[i].subscriptionsUsed.length > 0 ? users[i].subscriptionsUsed[users[i].subscriptionsUsed.length-1].endsAt : creation

        const nextSubscriptionEnd = subscriptionEnds(nextSubscriptionStart)

        if(nextSubscriptionEnd > new Date()){
            console.log("skipping because next subscription is not done")
            continue
        }

        console.log("Current subscriptions", users[i].subscriptionsUsed.length)
        console.log("Next subscription", formatDate(nextSubscriptionStart), formatDate(nextSubscriptionEnd))

        await createPromises(userId, subscription.price, nextSubscriptionStart, nextSubscriptionEnd, subscription.id)
        break
    }
     */
}
