import { ReactNode } from "react"
import { getAdminStats } from "../../actions/admin"
import { getUser } from "../../actions/users"
import { NotFoundPage } from "../../components/not-found-page"
import { ThreeColumnsLayout } from "../../components/three-columns"
import { SubscriptorsByDate } from "../../components/subscriptors-by-week"
import { ViewsByDaySinceSignup } from "../../components/views-since-signup"


function getMedianViewsByDay(viewsByDay: number[]){
    let sum = 0
    viewsByDay.forEach((x) => {sum += x})

    let curSum = 0
    for(let i = 0; i < viewsByDay.length; i++){
        curSum += viewsByDay[i]
        if(curSum >= sum / 2){
            return i
        }
    }
    return null
}


const Stat = ({children}: {children: ReactNode}) => {
    return <div className="bg-[var(--secondary-light)] content-container rounded-lg flex my-2">
        <div className="px-2 py-1 w-full">
            {children}
        </div>
    </div>
}


export default async function Page() {
    const {user, error} = await getUser()
    if(error || !user || (user.editorStatus != "Administrator" && user.id != "tomas")){
        return <NotFoundPage/>
    }

    const stats = await getAdminStats()

    const center = <div className="flex flex-col items-center w-full">
        <Stat>
            Cuentas: {stats.accounts}
        </Stat>
        <Stat>
            Objetivo lunes que viene: {Math.ceil(stats.eventsByWeek[stats.eventsByWeek.length-2].accounts * 1.1)}
        </Stat>

        <SubscriptorsByDate name="Cuentas" data={stats.eventsByWeek.map(({date, accounts}) => ({date, count: accounts}))}/>
        <SubscriptorsByDate name="Contenidos" data={stats.eventsByWeek.map(({date, contents}) => ({date, count: contents}))}/>
        <SubscriptorsByDate name="Reacciones" data={stats.eventsByWeek.map(({date, reactions}) => ({date, count: reactions}))}/>

        <div>
            <h3>Suscripciones por precio: </h3>
            
            {stats.sellsByPrice.map((p, index) => {
                    return <div key={index}>
                        <Stat>
                            <div className="flex space-x-4">
                                <span>Precio: {p.price}</span>
                                <span>Cantidad: {p._count.price}</span>
                            </div>
                        </Stat>
                    </div>
                })
            }
        </div>
        <div>
            <h3>
                Vistas por día desde el registro
            </h3>
            <div className="flex flex-col items-center">
                <Stat>
                    <span>Mediana: {getMedianViewsByDay(stats.viewsByDay)}</span>
                </Stat>
                <ViewsByDaySinceSignup viewsByDay={stats.viewsByDay}/>
            </div>
        </div>

        <div>
            <h3>
                No renovadas
            </h3>
            <div>
                <Stat>
                    Total: {stats.unrenewed.size}
                </Stat>
                <div className="flex flex-wrap space-x-2">
                    {Array.from(stats.unrenewed).map((x: string) => (<div key={x}>{x}</div>))}
                </div>
            </div>
        </div>

        <div className="mt-8">
            <h3>
                Últimas cuentas creadas
            </h3>
            {stats.lastAccounts.map((u, index) => {
                return <div key={index}>
                    {u.id}
                </div>
            })}
        </div>

        <div className="mt-8">
            <h3>
                Contenidos por usuario
            </h3>
            {stats.contentsByUser.map((u, index) => {
                return <div key={index}>
                    {u.authorId} {u._count.authorId}
                </div>
            })}
        </div>

    </div>

    return <ThreeColumnsLayout center={center}/>
}