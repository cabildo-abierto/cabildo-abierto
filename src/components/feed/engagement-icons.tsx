import { ContentOptionsButton } from "../content-options/content-options-button"
import { ActiveLikeIcon } from "../icons/active-like-icon"
import { InactiveCommentIcon } from "../icons/inactive-comment-icon"
import { InactiveLikeIcon } from "../icons/inactive-like-icon"
import { RepostIcon } from "../icons/reposts-icon"
import { FixedCounter, LikeCounter } from "../like-counter"
import {addLike, removeLike, removeRepost, repost} from "../../actions/contents";
import {EngagementProps, RecordProps} from "../../app/lib/definitions";
import {ViewsIcon} from "../icons/views-icon";
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import {CustomLink} from "../custom-link";
import {contentUrl} from "../utils";


type EngagementIconsProps = {
    counters: EngagementProps
    record: RecordProps
    className?: string
    small?: boolean
}

export const EngagementIcons = ({counters, record, className="space-x-16"}: EngagementIconsProps) => {
    return <div className={"flex items-center exclude-links " + className}>
        {record.collection != "ar.com.cabildoabierto.topic" && <>
        {counters.replyCount != undefined && <CustomLink href={contentUrl(record.uri)}>
            <FixedCounter
            count={counters.replyCount}
            icon={<InactiveCommentIcon/>}
            title="Cantidad de respuestas."
        /></CustomLink>}
        {counters.repostCount != undefined && <LikeCounter
            icon1={<span className={"text-green-400"}><RepostIcon fontSize={"small"}/></span>}
            icon2={<RepostIcon fontSize={"small"}/>}
            onLike={async () => {return await repost(record.uri, record.cid)}}
            onDislike={removeRepost}
            title="Cantidad de republicaciones."
            likeUri={counters.viewer ? counters.viewer.repost : undefined}
            initialCount={counters.repostCount}
        />}
        {counters.likeCount != undefined && <LikeCounter
            icon1={<span className={"text-red-400"}><ActiveLikeIcon fontSize={"small"}/></span>}
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
        {counters.visualizationsUsingCount != undefined && <FixedCounter
            count={counters.visualizationsUsingCount}
            icon={<AutoGraphIcon/>}
            title="Cantidad de visualizaciones que lo usaron."
        />}

        </>}

        <ContentOptionsButton
            record={record}
        />
    </div>
}