import { FeedContentProps } from "../../app/lib/definitions"
import { ContentOptionsButton } from "../content-options/content-options-button"
import { ActiveLikeIcon } from "../icons/active-like-icon"
import { InactiveCommentIcon } from "../icons/inactive-comment-icon"
import { InactiveLikeIcon } from "../icons/inactive-like-icon"
import { RepostIcon } from "../icons/reposts-icon"
import { FixedCounter, LikeCounter } from "../like-counter"


export const EngagementIcons = ({content}: {content: FeedContentProps}) => {
    return <div className="flex space-x-16">
        <FixedCounter
            count={content.replyCount}
            icon={<InactiveCommentIcon/>}
            title="Cantidad de respuestas."
        />
        <FixedCounter
            count={content.repostCount}
            icon={<RepostIcon/>}
            title="Cantidad de republicaciones."
        />
        <LikeCounter
            content={content}
            icon1={<ActiveLikeIcon/>}
            icon2={<InactiveLikeIcon/>}
            title="Cantidad de me gustas."
        />
        <ContentOptionsButton
            content={undefined}
            optionList={[]}
        />
    </div>
}