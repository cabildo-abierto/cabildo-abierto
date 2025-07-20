

export function stopPropagation(func: () => void) {
    return (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        func()
    }
}


export function isValidJSON(s: string) {
    try {
        JSON.parse(s)
    } catch {
        return false
    }
    return true
}


/*export function subscriptionEnds(start: Date): Date {
    const endDate = new Date(start);

    endDate.setMonth(endDate.getMonth() + 1);

    return endDate;
}*/


export function nextSubscriptionEnd(user: { subscriptionsUsed: { endsAt: string | Date }[] }, extraMonths: number = 0) {
    const currentSubscriptionEnd = new Date(user.subscriptionsUsed[user.subscriptionsUsed.length - 1].endsAt as Date | string)
    const nextEnd = new Date(currentSubscriptionEnd)
    nextEnd?.setMonth(nextEnd.getMonth() + extraMonths)

    return nextEnd
}


export function getUsername(user: { displayName?: string, handle: string, did: string }) {
    return user.displayName ? user.displayName : (user.handle ? "@" + user.handle : user.did)
}


export const ErrorMsg = ({text}: { text: string }) => {
    return <div className="text-red-600 text-sm">
        {text}
    </div>
}


export function logTimes(s: string, times: number[]){
    const diffs: number[] = []
    for(let i = 1; i < times.length; i++){
        diffs.push(times[i]-times[i-1])
    }
    const sum = diffs.join(" + ")
    console.log(s, times[times.length-1]-times[0], "=", sum)
}


export const emptyChar = <>&nbsp;</>