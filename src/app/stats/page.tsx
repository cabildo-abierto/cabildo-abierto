import { ReactNode } from "react"
import { getAdminStats } from "../../actions/admin"
import { getUser } from "../../actions/users"
import { NotFoundPage } from "../../components/not-found-page"
import { ThreeColumnsLayout } from "../../components/three-columns"
import { SubscriptorsByWeek } from "../../components/subscriptors-by-week"


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
            Suscriptores: {stats.subscriptors}
        </Stat>
        <Stat>
            Objetivo lunes que viene: {stats.subscriptorsByWeek[stats.subscriptorsByWeek.length-1].count * 1.1}
        </Stat>

        <SubscriptorsByWeek data={stats.subscriptorsByWeek}/>

        <Stat>
            Cuentas: {stats.accounts}
        </Stat>

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
            <h3>Suscripciones donadas:</h3>
            
            {stats.sellsByIsDonation.map((p, index) => {
                    return <div key={index}>
                        <Stat>
                            <div className="flex space-x-4">
                                <span>Es donación: {p.isDonation ? "Sí" : "No"}</span>
                                <span>Cantidad: {p._count.isDonation}</span>
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
            <div className="flex flex-col">
                {stats.viewsByDay.slice(0, 60).map((c, index) => {
                    return <div key={index} className="flex justify-between w-16">
                        <div>
                            {index}
                        </div>
                        <div>
                            {c}
                        </div>
                    </div>
                })}
            </div>
            </div>
        </div>

    </div>

    return <ThreeColumnsLayout center={center}/>
}