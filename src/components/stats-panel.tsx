"use client"
import {ReactNode} from "react";
import InfoPanel from "./info-panel";
import {UserStats} from "../app/lib/definitions";

const UserStat = ({name, value, border=true}: {name: ReactNode, value: ReactNode, border?: boolean}) => {
    return <div className={"flex justify-between py-2 " + (border ? "border-b" : "")}>
        <span>{name}</span>
        <span className="font-bold ml-8">{value}</span>
    </div>
}

export const StatsPanel = ({stats}: {stats: UserStats}) => {

    //let entities = userContents.userContents.filter((({type}) => (type == "EntityContent"))).map((content) => (content.parentEntityId))

    //entities = Array.from(new Set(entities))

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
    <InfoPanel iconClassName="ml-2 text-gray-600" text='Ingresos que te fueron confirmados pero por los que todavía no recibiste una transferencia.'/>
    </span>


    return <div className="mx-6 text-lg flex flex-col">
        <UserStat name="Publicaciones individuales" value={stats.posts}/>
        <UserStat name="Temas editados" value={stats.editedEntities}/>
        <UserStat name="Ediciones totales en temas" value={stats.entityEdits}/>
        <UserStat name='Caracteres agregados en temas' value={stats.entityAddedChars}/>
        <UserStat name='Votos hacia arriba totales' value={stats.reactionsInEntities + stats.reactionsInPosts}/>
        <UserStat name='Votos hacia arriba en publicaciones' value={stats.reactionsInPosts}/>
        <UserStat name='Votos hacia arriba en temas' value={stats.reactionsInEntities}/>
        <UserStat name='Vistas totales' value={stats.viewsInPosts+stats.viewsInEntities}/>
        <UserStat name='Vistas en publicaciones' value={stats.viewsInPosts}/>
        <UserStat name='Vistas en temas' value={stats.viewsInEntities}/>

        <UserStat name={incomeDesc} value={stats.income.toFixed(2)}/>
        <UserStat name={confirmationPendingDesc} value={stats.pendingConfirmationIncome.toFixed(2)}/>
        <UserStat name={paymentPendingDesc} value={stats.pendingPayIncome.toFixed(2)} border={false}/>
    </div>
}
