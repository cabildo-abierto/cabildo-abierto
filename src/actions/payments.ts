'use server'

import { revalidateTag, unstable_cache } from "next/cache";
import { db } from "../db";
import { getContentById } from "./contents";
import { accessToken, contributionsToProportionsMap, isDemonetized } from "../components/utils";
import { getUserById } from "./users";
import { pathLogo } from "../components/logo";
import MercadoPagoConfig, { Preference } from "mercadopago";
import { UserProps } from "../app/lib/definitions";



export async function extendContentStallPaymentDate(contentId: string): Promise<{error?: string}>{
    const {content, error} = await getContentById(contentId)
    if(error) return {error}

    try {
        await db.content.update({
            data: {
                stallPaymentUntil: content.stallPaymentDate
            },
            where: {
                id: contentId
            }
        })
    } catch {
        return {error: "Error al extender la fecha."}
    }

    revalidateTag("content:"+contentId)
    return {}
}

const baseUrl = "https://www.cabildoabierto.com.ar"
//const baseUrl = "localhost:3000"

export async function createPreference(userId: string, amount: number, donationsAmount) {
    const client = new MercadoPagoConfig({ accessToken: accessToken });
    const preference = new Preference(client);

    const price = await getSubscriptionPrice()

    if(amount + donationsAmount == 0) return {error: "No es posible iniciar un pago por 0 suscripciones."}

    let title = null
    if(amount == 0){
        if(donationsAmount == 1){
            title = "Un mes de suscripción donado"
        } else {
            title = donationsAmount + " suscripciones donadas"
        }
    } else if(amount == 1){
        if(donationsAmount == 0){
            title = "Un mes de suscripción"
        } else if(donationsAmount == 1){
            title = "Un mes para vos y uno donado"
        } else {
            title = "Un mes para vos y " + donationsAmount + " donados"
        }
    } else if(amount > 1){
        if(donationsAmount == 0){
            title = amount + " meses de suscripción"
        } else if(donationsAmount == 1){
            title = amount + " meses para vos y uno donado"
        } else {
            title = amount + " meses para vos y " + donationsAmount + " meses donados"
        }
    }

    let items = [{
        picture_url: baseUrl+pathLogo,
        id: "0",
        title: title,
        quantity: 1,
        unit_price: (donationsAmount + amount) * price.price,
        currencyId: "ARS"
    }]

    try {
        const result = await preference.create({
            body: {
              back_urls: {
                  success: baseUrl+"/suscripciones/pago-exitoso",
                  pending: baseUrl+"/suscripciones/pago-pendiente",
                  failure: baseUrl+"/suscripciones/pago-fallido"
              },
              notification_url: baseUrl+"/api/pago?source_news=webhooks",
              items: items,
              metadata: {
                  user_id: userId,
                  amount: (amount+donationsAmount)
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
    return unstable_cache(async () => {
        const count = await db.subscription.count({
            where: {
                price: {
                    gte: 500,
                }
            }
        })
        if(count < 200){
            return {price: 500, remaining: 200-count}
        } else {
            return {price: 1000, remaining: 1000-count}
        }
    }, ["subscriptionPrice"], {tags: ["subscriptionPrice"]})()
}


export async function newContactMail(mail: string){
    await db.contactEmails.create({
        data: {
          mail: mail
        }
    })
}


export async function createPaymentPromisesForEntityView(view: {content: {id: string, authorId: string, createdAt: Date}}, viewValue: number, subscriptionId: string){

    console.log("creating payment promises for entity view")

    const {content, error} = await getContentById(view.content.id)
    if(error) return {error}
    
    const contributions = contributionsToProportionsMap(JSON.parse(content.contribution))

    const authors = Object.keys(contributions)
    console.log("contributions map", contributions)

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
}


export async function createPaymentPromisesForEntityViews(user: UserProps, amount: number, start: Date, end: Date, subscriptionId: string){
    const entityViews = await db.view.findMany({
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
            userById: user.id,
            content: {
                type: "EntityContent"
            },
            createdAt: {
                gte: start
            }
        }
    })

    const viewValue = amount / entityViews.length

    for(let i = 0; i < entityViews.length; i++){
        const view = entityViews[i]
        await createPaymentPromisesForEntityView(view, viewValue, subscriptionId)
    }
}


export async function createPaymentPromisesForContentReactions(user: UserProps, amount: number, start: Date, end: Date, subscriptionId: string){
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
            userById: user.id,
            content: {
                type: "Post"
            },
            createdAt: {
                gte: start
            }
        }
    })

    const reactionValue = amount / contentReactions.length

    for(let i = 0; i < contentReactions.length; i++){
        const reaction = contentReactions[i]
        console.log("creating payment promise for post reaction", reaction.content.id, "with value", reactionValue)
        await db.paymentPromise.create({
            data: {
                authorId: reaction.content.authorId,
                subscriptionId: subscriptionId,
                contentId: reaction.content.id,
                amount: reactionValue
            }
        })
    }
}


export async function createPaymentPromises(){
    const curDate = new Date()

    const subscriptions = await db.subscription.findMany({
        select: {
            id: true,
            usedAt: true,
            endsAt: true,
            userId: true,
            boughtByUserId: true,
            createdAt: true,
            price: true
        },
        where: {
            price: {
                gt: 0
            },
            usedAt: {
                not: null
            },
            endsAt: {
                lt: curDate
            },
            promisesCreated: false
        }
    })

    console.log("ended subscriptions found", subscriptions.length)
    for(let i = 0; i < subscriptions.length; i++){
        const s = subscriptions[i]
        await createPromises(s.userId, s.price*0.64, s.usedAt, s.endsAt, s.id)
    }
}


export async function createPromises(userId: string, amount: number, start: Date, end: Date, subscriptionId: string){
    const {user, error} = await getUserById(userId)
    if(error) return {error}

    console.log("creating promises by user", user.id, "with total value", amount, "between", start, "and", end)
    await createPaymentPromisesForEntityViews(user, amount*0.5, start, end, subscriptionId)
    await createPaymentPromisesForContentReactions(user, amount*0.5, start, end, subscriptionId)

    return {}
}


export async function reassignPromise(p: {id: string, amount: number, subscription: {id: string, userId: string, usedAt: Date, endsAt: Date}}) {
    await db.paymentPromise.update({
        data: {
            status: "Canceled"
        },
        where: {
            id: p.id
        }
    })
    await createPromises(p.subscription.userId, p.amount, p.subscription.usedAt, p.subscription.endsAt, p.subscription.id)
}


export async function confirmPayments() {
    const promises = await db.paymentPromise.findMany({
        select: {
            id: true,
            amount: true,
            subscription: {
                select: {
                    price: true,
                    userId: true,
                    usedAt: true,
                    endsAt: true,
                    id: true
                }
            },
            content: {
                select: {
                    stallPaymentUntil: true,
                    undos: {
                        select: {
                            id: true
                        }
                    },
                    claimsAuthorship: true,
                    rejectedById: true,
                    charsAdded: true,
                    confirmedById: true,
                    editPermission: true
                }
            }
        },
        where: {
            status: "Pending"
        }
    })

    console.log("unconfirmed promises found", promises.length)
    const curDate = new Date()
    for(let i = 0; i < promises.length; i++){
        const p = promises[i]
        if(p.content.stallPaymentUntil < curDate){
            if(isDemonetized(p.content)){
                await reassignPromise(p)
            } else {
                await db.paymentPromise.update({
                    data: {
                        status: "Confirmed"
                    },
                    where: {
                        id: p.id
                    }
                })
            }
        }
    }
}