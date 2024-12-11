//import { getPaymentsStats } from "../../actions/admin"
import { getUser } from "../../actions/users"
import { NotFoundPage } from "../../components/not-found-page"
import { ThreeColumnsLayout } from "../../components/three-columns"
import { formatDate, getEntityMonetizedContributions } from "../../components/utils"
import { ConfirmPaymentsButton, CreatePromisesButton } from "./create-promises-button"


export default async function Page() {
    const {user} = await getUser()

    if(!user || (user.editorStatus != "Administrator" && user.did != "tomas")){
        return <NotFoundPage/>
    }

    //const {userMonths, entities, accounts} = await getPaymentsStats()


    /*const center = <div className="flex items-center flex-col">
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

        <h1>Temas</h1>

        <div className="flex flex-col">
            {entities.map((m, index) => {
                const c = getEntityMonetizedContributions(m, m.versions.length-1)
                if(!c) {
                    return <></>
                }
                if(c.length > 1){
                    return <div key={index} className="flex space-x-2">
                        {m.name} {c.map((a, index) => {
                            return <div key={index} className="p-1 border rounded">
                                {a[0]} {a[1]}
                            </div>
                        })}
                    </div>
                } else {
                    return <></>
                }
            })}
        </div>

        <div>
            <CreatePromisesButton/>
            <ConfirmPaymentsButton/>
            <h1>Promesas creadas</h1>

            {accounts.map((a, index) => {
                let total = 0
                let users = new Set<string>()
                a.paymentPromises.forEach((p) => {
                    total += p.amount
                    users.add(p.subscription.userId)
                })
                if(total == 0) return <></>
                return <div key={index} className="flex">
                    {a.did} {total.toFixed(2)} <div className="flex flex-wrap space-x-2 ml-2">{Array.from(users).map((u, index2) => {return <div key={index2}>{u}</div>})}</div>
                </div>
            })}
            <h1>Pagos confirmados</h1>

            {accounts.map((a, index) => {
                let total = 0
                let users = new Set<string>()
                a.paymentPromises.forEach((p) => {
                    if(p.status == "Confirmed"){
                        total += p.amount
                        users.add(p.subscription.userId)
                    }
                })
                if(total == 0) return <></>
                return <div key={index} className="flex">
                    {a.did} {total.toFixed(2)} <div className="flex flex-wrap space-x-2 ml-2">{Array.from(users).map((u, index2) => {return <div key={index2}>{u}</div>})}</div>
                </div>
            })}
        </div>
    </div>*/

    const center = <div>TO  DO</div>

    return <ThreeColumnsLayout center={center}/>
}