import { recomputeAllContributions, revalidateEntities, revalidateContents, revalidateNotifications, revalidateUsers, revalidateFeed, revalidateDrafts, revalidateSearchkeys, compressContents, compressContent, decompressContents, decompressContent, updateUniqueViewsCount, updateIsDraft, deleteEntity, computeDayViews, computeSubscriptorsByDay, getPaymentsStats } from "../../actions/admin"
import { updateAllUniqueCommentators, notifyAllMentions, deleteUser } from "../../actions/contents"
import { recomputeEntityContributions } from "../../actions/entities"
import { createPaymentPromises, confirmPayments } from "../../actions/payments"
import { updateAllReferences, updateAllWeakReferences } from "../../actions/references"
import { assignSubscriptions, buySubscriptions, desassignSubscriptions, getUser, recoverSubscriptions } from "../../actions/users"
import { NotFoundPage } from "../../components/not-found-page"
import { ThreeColumnsLayout } from "../../components/three-columns"
import { formatDate, subscriptionEnds } from "../../components/utils"


export default async function Page() {
    const {user} = await getUser()

    if(!user || (user.editorStatus != "Administrator" && user.id != "tomas")){
        return <NotFoundPage/>
    }

    const stats = await getPaymentsStats()

    const userMonths: {
        userId: string
        reactions: {createdAt: Date}[],
        views: {createdAt: Date}[]
        start: Date
        end: Date
    }[] = []

    stats.accounts.forEach((a, index) => {
        let date = a.createdAt
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

            const viewsOnMonth: {createdAt: Date}[] = []
            a.views.forEach((v) => {
                if(v.createdAt < end && v.createdAt >= start){
                    viewsOnMonth.push(v)
                }
            })

            const reactionsOnMonth: {createdAt: Date}[] = []
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

    const center = <div className="flex items-center flex-col">
        <h1>Pagos</h1>
        
        <div>
            {userMonths.map((m, index) => {
                return <div key={index}>
                    {m.userId} {formatDate(m.start)} {formatDate(m.end)} {m.views.length} {m.reactions.length}
                </div>
            })}
        </div>
    </div>

    return <ThreeColumnsLayout center={center}/>
}