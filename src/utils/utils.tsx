

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


export function validSubscription(user: { subscriptionsUsed: { endsAt: string | Date }[] } | undefined) {
    if (!user) return false
    if (user.subscriptionsUsed.length == 0) return false

    const nextEnd = nextSubscriptionEnd(user)
    return nextEnd > new Date()
}


export function getUsername(user: { displayName?: string, handle: string }) {
    return user.displayName ? user.displayName : "@" + user.handle
}


export const ErrorMsg = ({text}: { text: string }) => {
    return <div className="text-red-600 text-sm">
        {text}
    </div>
}


export const emptyChar = <>&nbsp;</>