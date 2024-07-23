import SubscriptionCheckWrapper from "./subscription-check-wrapper"


export const splitPost = (text) => {
    if(!text.includes("</h1>")) return null
    const split = text.split("</h1>")
    if(!split[0].includes("<h1>")) return null
    if(split[1].length == 0) return null
    const title = split[0].split("<h1>")[1]
    if(title == "&nbsp;") return null
    return {title: title, text: split[1]}
}


export function stopPropagation(func) {
    return (e) => {e.stopPropagation(); func()}
}


export function validSubscription(user){
    if(!user) return false
    if(user.subscriptionsUsed.length == 0) return false

    const lastPaymentDate = user.subscriptionsUsed[user.subscriptionsUsed.length-1].usedAt
  
    const nextSubscriptionEnd = new Date(lastPaymentDate)
    
    nextSubscriptionEnd?.setMonth(lastPaymentDate.getMonth()+1)
  
    return nextSubscriptionEnd > new Date()
}


export function requireSubscription(component, require){
    if(require){
        return <SubscriptionCheckWrapper>
            {component}
        </SubscriptionCheckWrapper>
    } else {
        return component
    }
}


export function validPost(text){
    return splitPost(text) != null
}

export function validFastPost(text){
    return text.length > 0
}
