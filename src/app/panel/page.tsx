"use client"
import { useUser, useUserContents } from "../hooks/user"
import { useContent, useUserStats } from "../hooks/contents"
import { useEntity } from "../hooks/entities"
import Link from "next/link"
import { DateSince } from "../../components/date"
import { ActiveLikeIcon, StatsIcon, ArticleIcon, PostIcon } from "../../components/icons"
import { FixedCounter } from "../../components/like-counter"
import LoadingSpinner from "../../components/loading-spinner"
import { PostTitleOnFeed } from "../../components/post-on-feed"
import { ShowContributors } from "../../components/show-contributors"
import { ThreeColumnsLayout } from "../../components/three-columns"
import InfoPanel from "../../components/info-panel"
import { ReactNode } from "react"

const EntityIncome = ({entityId}: {entityId: string}) => {
    const {user} = useUser()
    const entity = useEntity(entityId)

    if(entity.isLoading){
        return <LoadingSpinner/>
    }

    if(!entity.entity){
        return <></>
    }

    return <Link
        className="content-container p-1 flex flex-col w-full cursor-pointer"
        href={"/articulo/"+encodeURIComponent(entityId)}
        >
        <div className="flex justify-between">
            <PostTitleOnFeed title={entity.entity.name}/>
            <FixedCounter count={0} icon={<ActiveLikeIcon/>}/>
        </div>

        <div className="flex justify-between px-1">
            <ShowContributors contentId={entity.entity.versions[entity.entity.versions.length-1].id} userId={user.id}/>
            <DateSince date={entity.entity.versions[0].createdAt}/>
        </div>
    </Link>
}

const PostIncome = ({postId}: {postId: string}) => {
    const content = useContent(postId)

    if(content.isLoading){
        return <LoadingSpinner/>
    }
    return <Link
        href={"/contenido/"+postId}
        className="content-container p-1 flex flex-col w-full"
    >
        <div className="flex justify-between">
            <PostTitleOnFeed title={content.content.title}/>
            <FixedCounter count={content.content._count.reactions} icon={<ActiveLikeIcon/>}/>
        </div>
        <div className="flex justify-end mr-1">
        <DateSince date={content.content.createdAt}/>
        </div>
    </Link>
}

const UserStat = ({name, value}: {name: ReactNode, value: number}) => {
    return <div className="flex justify-between border-b py-2">
        <span>{name}</span>
        <span className="font-bold ml-8">{value}</span>
    </div>
}

const ShowUserStats = () => {
    const stats = useUserStats()
    if(stats.isLoading){
        return <LoadingSpinner/>
    }

    
    const incomeDesc = <span>
        Ingresos acumulados totales ($)
        <InfoPanel iconClassName="ml-2 text-gray-600" text='El total de ingresos confirmados que te corresponden. No necesariamente recibiste un pago por todos ellos (ver "Pendientes de pago").'/>
    </span>

    const confirmationPendingDesc = <span>
    Ingresos pendientes de confirmación ($)
    <InfoPanel iconClassName="ml-2 text-gray-600" text='Ingresos que te corresponden por contenidos que escribiste recientemente pero que todavía están en período de evaluación.'/>
    </span>

    const paymentPendingDesc = <span>
    Ingresos pendientes de pago ($)
    <InfoPanel iconClassName="ml-2 text-gray-600" text='Ingresos que te fueron confirmados pero por los que todavía no recibiste una transferencia. Mientras tanto podés usarlos para comprar suscripciones.'/>
    </span>


    return <div className="mx-6 text-lg flex flex-col border-t">
        <UserStat name="Publicaciones individuales" value={stats.stats.posts}/>
        <UserStat name="Artículos públicos editados" value={stats.stats.editedEntities}/>
        <UserStat name="Ediciones totales en artículos públicos" value={stats.stats.entityEdits}/>
        <UserStat name='Caracteres agregados en artículos públicos' value={stats.stats.entityAddedChars}/>
        <UserStat name='"Me sirvió" totales' value={stats.stats.reactionsInEntities + stats.stats.reactionsInPosts}/>
        <UserStat name='"Me sirvió" en publicaciones' value={stats.stats.reactionsInPosts}/>
        <UserStat name='"Me sirvió" en artículos públicos' value={stats.stats.reactionsInEntities}/>
        <UserStat name='Vistas totales' value={stats.stats.viewsInPosts+stats.stats.viewsInEntities}/>
        <UserStat name='Vistas en publicaciones' value={stats.stats.viewsInPosts}/>
        <UserStat name='Vistas en entidades' value={stats.stats.viewsInEntities}/>

        <UserStat name={incomeDesc} value={stats.stats.income}/>
        <UserStat name={confirmationPendingDesc} value={stats.stats.pendingConfirmationIncome}/>
        <UserStat name={paymentPendingDesc} value={stats.stats.pendingPayIncome}/>
    </div>
}


const Page = () => {
    const {user} = useUser()

    const userContents = useUserContents(user.id)
    if(userContents.isLoading){
        return <LoadingSpinner/>
    }
    let entities = userContents.userContents.filter((({type}) => (type == "EntityContent"))).map((content) => (content.parentEntityId))
    entities = Array.from(new Set(entities))
    
    let posts = Array.from(new Set(userContents.userContents.filter((({type}) => (type == "Post"))))).map((post) => (post.id))

    const center = <div className="mt-8 content-container shadow rounded px-4 py-4">
        <h3 className="mb-8">Tus estadísticas <StatsIcon/></h3>
        <div>
            <ShowUserStats/>
        </div>
    </div>

    return <ThreeColumnsLayout center={center}/>
}

export default Page