import { EntityProps, UserProps } from "src/app/lib/definitions"
import assert from "assert"


export const splitPost = (text: string) => {
    if(!text.includes("</h1>")) return null
    const split = text.split("</h1>")
    if(!split[0].includes("<h1>")) return null
    if(split[1].length == 0) return null
    const title = split[0].split("<h1>")[1]
    if(title == "&nbsp;") return null
    return {title: title, text: split[1]}
}


export function stopPropagation(func: () => void) {
    return (e: any) => {e.stopPropagation(); func()}
}


export function validSubscription(user: UserProps | undefined){
    if(!user) return false
    if(user.subscriptionsUsed.length == 0) return false

    const lastPaymentDate = new Date(user.subscriptionsUsed[user.subscriptionsUsed.length-1].usedAt as Date | string)
    const nextSubscriptionEnd = new Date(lastPaymentDate)
    
    nextSubscriptionEnd?.setMonth(lastPaymentDate.getMonth()+1)
    
    return nextSubscriptionEnd > new Date()
}

export function getSubscriptionPrice() {
    return 1000
}


export const entityLastVersionId = (entity: EntityProps) => {
    return entity.versions[entity.versions.length-1].id
    assert(false)
}


export function sumFromFirstEdit(values: number[], entity: EntityProps, userId: string) {
    let total = 0
    let firstEdit = 0
    for(let i = 0; i < entity.versions.length; i++){
        if(entity.versions[i].authorId == userId){
            firstEdit = i
            break
        }
    }
    for(let i = firstEdit; i < values.length; i++) total += values[i]
    return total
}