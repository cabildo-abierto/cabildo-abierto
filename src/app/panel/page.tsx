"use client"
import { useUser, useUserContents } from "../hooks/user"
import { useUserStats } from "../hooks/contents"
import LoadingSpinner from "../../components/loading-spinner"
import { ThreeColumnsLayout } from "../../components/three-columns"
import InfoPanel from "../../components/info-panel"
import { ReactNode } from "react"
import { StatsIcon } from "../../components/icons"

const UserStat = ({name, value}: {name: ReactNode, value: ReactNode}) => {
    return <div className="flex justify-between border-b py-2">
        <span>{name}</span>
        <span className="font-bold ml-8">{value}</span>
    </div>
}

const ShowUserStats = () => {
    const {user} = useUser()

    const userContents = useUserContents(user.id)
    
    const stats = useUserStats()
    if(stats.isLoading){
        return <LoadingSpinner/>
    }

    if(userContents.isLoading){
        return <LoadingSpinner/>
    }
    
    let entities = userContents.userContents.filter((({type}) => (type == "EntityContent"))).map((content) => (content.parentEntityId))
    entities = Array.from(new Set(entities))
    
    //let posts = Array.from(new Set(userContents.userContents.filter((({type}) => (type == "Post"))))).map((post) => (post.id))

    const incomeDesc = <span>
        Ingresos acumulados totales ($)
        <InfoPanel iconClassName="ml-2 text-gray-600" text='El total de ingresos confirmados que recibiste. No necesariamente recibiste un pago por todos ellos todavía (ver "Pendientes de pago").'/>
    </span>

    const confirmationPendingDesc = <span>
    Ingresos pendientes de confirmación ($)
    <InfoPanel iconClassName="ml-2 text-gray-600" text='Ingresos que te corresponden por contenidos que escribiste recientemente pero que todavía están en período de evaluación. Si cumplen los términos y condiciones los pagos van a pasar a "pendientes de pago".'/>
    </span>

    const paymentPendingDesc = <span>
    Ingresos pendientes de pago ($)
    <InfoPanel iconClassName="ml-2 text-gray-600" text='Ingresos que te fueron confirmados pero por los que todavía no recibiste una transferencia. Mientras tanto podés usarlos para comprar suscripciones.'/>
    </span>


    return <div className="mx-6 text-lg flex flex-col">
        <UserStat name="Publicaciones individuales" value={stats.stats.posts}/>
        <UserStat name="Temas editados" value={stats.stats.editedEntities}/>
        <UserStat name="Ediciones totales en temas" value={stats.stats.entityEdits}/>
        <UserStat name='Caracteres agregados en temas' value={stats.stats.entityAddedChars}/>
        <UserStat name='Votos hacia arriba totales' value={stats.stats.reactionsInEntities + stats.stats.reactionsInPosts}/>
        <UserStat name='Votos hacia arriba en publicaciones' value={stats.stats.reactionsInPosts}/>
        <UserStat name='Votos hacia arriba en temas' value={stats.stats.reactionsInEntities}/>
        <UserStat name='Vistas totales' value={stats.stats.viewsInPosts+stats.stats.viewsInEntities}/>
        <UserStat name='Vistas en publicaciones' value={stats.stats.viewsInPosts}/>
        <UserStat name='Vistas en temas' value={stats.stats.viewsInEntities}/>

        <UserStat name={incomeDesc} value={stats.stats.income.toFixed(2)}/>
        <UserStat name={confirmationPendingDesc} value={stats.stats.pendingConfirmationIncome.toFixed(2)}/>
        <UserStat name={paymentPendingDesc} value={stats.stats.pendingPayIncome.toFixed(2)}/>
    </div>
}


const Page = () => {
    const {user} = useUser()

    const center = <div className="mt-8 flex flex-col items-center">
        <h2 className="mb-8">Tus estadísticas <StatsIcon/></h2>
        {user && <div className="bg-white shadow rounded-lg px-4 py-4 w-full">
            <ShowUserStats/>
        </div>}
    </div>

    return <ThreeColumnsLayout center={center}/>
}

export default Page