import { UserProps } from "@/actions/get-user"
import SubscriptionCheckWrapper from "./subscription-check-wrapper"


export const splitPost = (text: string) => {
    if(!text.includes("</h1>")) return null
    const split = text.split("</h1>")
    if(!split[0].includes("<h1>")) return null
    if(split[1].length == 0) return null
    const title = split[0].split("<h1>")[1]
    if(title == "&nbsp;") return null
    return {title: title, text: split[1]}
}


export function stopPropagation(func: any) {
    return (e: any) => {e.stopPropagation(); func()}
}


export function validSubscription(user: UserProps | null | undefined){
    if(!user) return false
    if(user.subscriptionsUsed.length == 0) return false

    const lastPaymentDate: Date = user.subscriptionsUsed[user.subscriptionsUsed.length-1].usedAt as Date
    
    const nextSubscriptionEnd = new Date(lastPaymentDate)
    
    nextSubscriptionEnd?.setMonth(lastPaymentDate.getMonth()+1)
  
    return nextSubscriptionEnd > new Date()
}


export function validPost(text: string){
    return splitPost(text) != null
}

export function validFastPost(text: string){
    return text.length > 0
}


export function getSubscriptionPrice() {
    return 1000
}