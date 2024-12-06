import {FastPostProps} from "../../app/lib/definitions"
import { ContentOptionsButton } from "../content-options/content-options-button"
import { ActiveLikeIcon } from "../icons/active-like-icon"
import { InactiveCommentIcon } from "../icons/inactive-comment-icon"
import { InactiveLikeIcon } from "../icons/inactive-like-icon"
import { RepostIcon } from "../icons/reposts-icon"
import { FixedCounter, LikeCounter } from "../like-counter"
import {addLike, removeLike, removeRepost, repost} from "../../actions/contents";


export const EngagementIcons = ({content}: {content: FastPostProps}) => {

    return <div className="flex space-x-16">
        <FixedCounter
            count={content.replyCount}
            icon={<InactiveCommentIcon/>}
            title="Cantidad de respuestas."
        />
        <LikeCounter
            content={content}
            icon1={<RepostIcon/>}
            icon2={<RepostIcon/>}
            onLike={async () => {return await repost(content.uri, content.cid)}}
            onDislike={removeRepost}
            title="Cantidad de republicaciones."
            likeUri={content.viewer ? content.viewer.repost : undefined}
            initialCount={content.repostCount}
        />
        <LikeCounter
            content={content}
            icon1={<ActiveLikeIcon/>}
            icon2={<InactiveLikeIcon/>}
            onLike={async () => {return await addLike(content.uri, content.cid)}}
            onDislike={removeLike}
            title="Cantidad de me gustas."
            likeUri={content.viewer ? content.viewer.like : undefined}
            initialCount={content.likeCount}
        />
        <ContentOptionsButton
            content={content}
            optionList={[]}
        />
    </div>
}