import { recomputeAllContributions, revalidateEntities, revalidateContents, revalidateNotifications, revalidateUsers, revalidateFeed, revalidateDrafts, revalidateSearchkeys, compressContents, compressContent, decompressContents, decompressContent, updateUniqueViewsCount, updateIsDraft, deleteEntity, computeDayViews, computeSubscriptorsByDay, getPaymentsStats } from "../../actions/admin"
import { updateAllUniqueCommentators, notifyAllMentions, deleteUser } from "../../actions/contents"
import { recomputeEntityContributions } from "../../actions/entities"
import { createPaymentPromises, confirmPayments } from "../../actions/payments"
import { updateAllReferences, updateAllWeakReferences } from "../../actions/references"
import { assignSubscriptions, buySubscriptions, desassignSubscriptions, getUser, recoverSubscriptions } from "../../actions/users"
import { NotFoundPage } from "../../components/not-found-page"
import { ThreeColumnsLayout } from "../../components/three-columns"
import { formatDate, launchDate, subscriptionEnds } from "../../components/utils"


export default async function Page() {
    const {user} = await getUser()

    if(!user || (user.editorStatus != "Administrator" && user.id != "tomas")){
        return <NotFoundPage/>
    }

    const {userMonths} = await getPaymentsStats()

    const center = <div className="flex items-center flex-col">
        <h1>Pagos</h1>
        
        <div>
            {userMonths.map((m, index) => {
                
                if(m.views.length == 0 && m.reactions.length == 0)
                    return <></>

                return <div key={index}>
                    {m.userId} {formatDate(m.start)} {formatDate(m.end)} {m.views.length} {m.reactions.length}
                </div>
            })}
        </div>
    </div>

    return <ThreeColumnsLayout center={center}/>
}