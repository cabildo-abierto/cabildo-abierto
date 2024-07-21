

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


export function getSubscriptionStatus(subscriptionsUsed: any[]){
    if(subscriptionsUsed.length == 0) return "invalid"

    const lastPaymentDate = subscriptionsUsed[subscriptionsUsed.length-1].usedAt
  
    const nextSubscriptionEnd = new Date(lastPaymentDate)
    
    nextSubscriptionEnd?.setMonth(lastPaymentDate.getMonth()+1)
  
    return nextSubscriptionEnd > new Date() ? "valid" : "invalid"
  }