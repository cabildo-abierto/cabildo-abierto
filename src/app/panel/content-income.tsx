"use client"
import { useEntity } from "../hooks/entities"
import { CustomLink as Link } from '../../components/custom-link';
import { DateSince } from "../../components/date"
import { ActiveLikeIcon } from "../../components/icons"
import { FixedCounter } from "../../components/like-counter"
import { PostTitleOnFeed } from "../../components/post-on-feed"
import { ShowUserContribution } from "../../components/show-contributors"
import { useUser } from "../hooks/user"
import { useContent } from "../hooks/contents"
import LoadingSpinner from "../../components/loading-spinner"
import { articleUrl, contentUrl } from "../../components/utils"

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
        href={articleUrl(entityId)}
        >
        <div className="flex justify-between">
            <PostTitleOnFeed title={entity.entity.name}/>
            <FixedCounter count={0} icon={<ActiveLikeIcon/>}/>
        </div>

        <div className="flex justify-between px-1">
            <ShowUserContribution entityId={entityId} userId={user.id}/>
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
        href={contentUrl(postId)}
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