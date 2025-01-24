import { ContentOptionsButton } from "../content-options/content-options-button"
import { ActiveLikeIcon } from "../icons/active-like-icon"
import { InactiveCommentIcon } from "../icons/inactive-comment-icon"
import { InactiveLikeIcon } from "../icons/inactive-like-icon"
import { RepostIcon } from "../icons/reposts-icon"
import { FixedCounter, LikeCounter } from "../like-counter"
import {addLike, removeLike, removeRepost, repost} from "../../actions/contents";
import {ReactNode} from "react";
import {EngagementProps} from "../../app/lib/definitions";
import {ViewsIcon} from "../icons/views-icon";

type EngagementIconsProps = {
    counters: EngagementProps
    options: ReactNode
    record: {
        uri: string
        cid: string
    }
    className?: string
}

export const EngagementIcons = ({counters, record, options, className="space-x-16"}: EngagementIconsProps) => {
    return <div className={"flex items-center " + className}>
        {counters.replyCount != undefined && <FixedCounter
            count={counters.replyCount}
            icon={<InactiveCommentIcon/>}
            title="Cantidad de respuestas."
        />}
        {counters.repostCount != undefined && <LikeCounter
            icon1={<RepostIcon fontSize={"small"}/>}
            icon2={<RepostIcon fontSize={"small"}/>}
            onLike={async () => {return await repost(record.uri, record.cid)}}
            onDislike={removeRepost}
            title="Cantidad de republicaciones."
            likeUri={counters.viewer ? counters.viewer.repost : undefined}
            initialCount={counters.repostCount}
        />}
        {counters.likeCount != undefined && <LikeCounter
            icon1={<ActiveLikeIcon fontSize={"small"}/>}
            icon2={<InactiveLikeIcon fontSize={"small"}/>}
            onLike={async () => {return await addLike(record.uri, record.cid)}}
            onDislike={removeLike}
            title="Cantidad de me gustas."
            likeUri={counters.viewer ? counters.viewer.like : undefined}
            initialCount={counters.likeCount}
        />}
        {counters.uniqueViewsCount != undefined && <FixedCounter
            icon={<ViewsIcon/>}
            count={counters.uniqueViewsCount+1} // always count the author
            title={"Cantidad de impresiones."}
        />
        }

        <ContentOptionsButton
            options={options}
        />
    </div>
}