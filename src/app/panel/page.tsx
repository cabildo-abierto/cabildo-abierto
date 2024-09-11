"use client"
import { ThreeColumnsLayout } from "src/components/three-columns"
import { useUser, useUserContents } from "../hooks/user"
import { useContent, useReactions, useUserStats } from "../hooks/contents"
import LoadingSpinner from "src/components/loading-spinner"
import { ActiveLikeIcon, ArticleIcon, PostIcon, StatsIcon } from "src/components/icons"
import { PostTitleOnFeed } from "src/components/post-on-feed"
import { useRouter } from "next/navigation"
import { DateSince } from "src/components/date"
import { useEntity, useEntityReactions } from "../hooks/entities"
import { ShowContributors } from "src/components/show-contributors"
import { sumFromFirstEdit } from "src/components/utils"
import { FixedCounter } from "src/components/like-counter"
import Link from "next/link"

const EntityIncome = ({entityId}: {entityId: string}) => {
    const {user} = useUser()
    const entity = useEntity(entityId)
    const reactions = useEntityReactions(entityId)

    if(entity.isLoading || reactions.isLoading){
        return <LoadingSpinner/>
    }

    if(!entity.entity){
        return <></>
    }

    let reactionsCount = 0
    if(reactions.reactions == null){
    } else {
        reactionsCount = sumFromFirstEdit(reactions.reactions, entity.entity, user.id)
    }


    return <Link
        className="content-container p-1 flex flex-col w-full cursor-pointer"
        href={"/articulo/"+encodeURIComponent(entityId)}
        >
        <div className="flex justify-between">
            <PostTitleOnFeed title={entity.entity.name}/>
            <FixedCounter count={reactionsCount} icon={<ActiveLikeIcon/>}/>
        </div>

        <div className="flex justify-between px-1">
            <ShowContributors contentId={entity.entity.versions[entity.entity.versions.length-1].id} userId={user.id}/>
            <DateSince date={entity.entity.versions[0].createdAt}/>
        </div>
    </Link>
}

const PostIncome = ({postId}: {postId: string}) => {
    const reactions = useReactions(postId)
    const content = useContent(postId)
    const router = useRouter()

    if(reactions.isLoading || content.isLoading){
        return <LoadingSpinner/>
    }
    return <Link
        href={"/contenido/"+postId}
        className="content-container p-1 flex flex-col w-full"
    >
        <div className="flex justify-between">
            <PostTitleOnFeed title={content.content.title}/>
            <FixedCounter count={reactions.reactions} icon={<ActiveLikeIcon/>}/>
        </div>
        <div className="flex justify-end mr-1">
        <DateSince date={content.content.createdAt}/>
        </div>
    </Link>
}

const UserStat = ({name, value}: {name: string, value: number}) => {
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

    return <div className="mx-6 text-lg flex flex-col border-t">
        <UserStat name="Publicaciones individuales" value={stats.stats.posts}/>
        <UserStat name="Artículos públicos editados" value={stats.stats.editedEntities}/>
        <UserStat name="Ediciones totales en artículos públicos" value={stats.stats.entityEdits}/>
        <UserStat name='Caracteres agregados en artículos públicos' value={stats.stats.entityAddedChars}/>
        <UserStat name='"Me sirvió" totales' value={stats.stats.reactionsInEntities + stats.stats.reactionsInPosts}/>
        <UserStat name='"Me sirvió" en publicaciones' value={stats.stats.reactionsInPosts}/>
        <UserStat name='"Me sirvió" en artículos públicos' value={stats.stats.reactionsInEntities}/>
        <UserStat name='Visualizaciones totales' value={stats.stats.viewsInPosts+stats.stats.viewsInEntities}/>
        <UserStat name='Visualizaciones en publicaciones' value={stats.stats.viewsInPosts}/>
        <UserStat name='Visualizaciones en entidades' value={stats.stats.viewsInEntities}/>
        <UserStat name='Ingresos acumulados ($)' value={stats.stats.income}/>
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

    const center = <>
        <h3 className="py-8">Tus estadísticas <StatsIcon/></h3>
        <div>
            <ShowUserStats/>
        </div>
        <h3 className="py-8">Ediciones en artículos públicos <ArticleIcon/></h3>
        <div className="flex flex-col space-y-2 px-4">
            {entities.map((entityId, index) => {
                return <div key={index}>
                    <EntityIncome entityId={entityId}/>
                </div>
            })}
        </div>

        <h3 className="py-8">Publicaciones individuales <PostIcon/></h3>
        <div className="flex flex-col space-y-2 px-4">
        
        {posts.map((postId, index) => {
            return <div key={index} className="">
                <PostIncome postId={postId}/>
            </div>
        })}
        </div>
    </>

    return <ThreeColumnsLayout center={center}/>
}

export default Page