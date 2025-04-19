import { ContentOptionsButton } from "@/components/feed/content-options/content-options-button"
import { ActiveLikeIcon } from "../../icons/active-like-icon"
import { InactiveCommentIcon } from "../../icons/inactive-comment-icon"
import { InactiveLikeIcon } from "../../icons/inactive-like-icon"
import { RepostIcon } from "../../icons/reposts-icon"
import { FixedCounter, LikeCounter } from "./like-counter"
import {ATProtoStrongRef, EngagementProps} from "@/lib/definitions";
import {ViewsIcon} from "../../icons/views-icon";
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import {CustomLink} from "../../../../modules/ui-utils/src/custom-link";

import {contentUrl, getCollectionFromUri} from "@/utils/uri";


type EngagementIconsProps = {
    counters: EngagementProps
    record: ATProtoStrongRef
    className?: string
    small?: boolean
    onDelete?: () => Promise<void>
    enDiscusion?: boolean
}





export const EngagementIcons = ({
    counters,
    record,
    className="space-x-16",
    onDelete=async () => {},
    enDiscusion
}: EngagementIconsProps) => {

    const onDislike = async () => {
        //return await removeLike(counters.viewer.like, record.uri)
        return {}
    }

    const onRemoveRepost = async () => {
        //return await removeRepost(counters.viewer.repost, record.uri)
        return {}
    }

    const onAddRepost = async () => {
        //return await repost(record.uri, record.cid)
        return {}
    }

    const onLike = async () => {
        // return await addLike(record.uri, record.cid)
        return {}
    }

    return <div className={"flex items-center exclude-links " + className}>
        {getCollectionFromUri(record.uri) != "ar.com.cabildoabierto.topic" && <>
        {counters.replyCount != undefined && <CustomLink href={contentUrl(record.uri)}>
            <FixedCounter
            count={counters.replyCount}
            icon={<InactiveCommentIcon/>}
            title="Cantidad de respuestas."
        /></CustomLink>}
        {counters.repostCount != undefined && <LikeCounter
            icon1={<span className={"text-green-400"}><RepostIcon fontSize={"small"}/></span>}
            icon2={<RepostIcon fontSize={"small"}/>}
            onLike={onAddRepost}
            onDislike={onRemoveRepost}
            title="Cantidad de republicaciones."
            likeUri={counters.viewer ? counters.viewer.repost : undefined}
            initialCount={counters.repostCount}
        />}
        {counters.likeCount != undefined && <LikeCounter
            icon1={<span className={"text-red-400"}><ActiveLikeIcon fontSize={"small"}/></span>}
            icon2={<InactiveLikeIcon fontSize={"small"}/>}
            onLike={onLike}
            onDislike={onDislike}
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
            onDelete={onDelete}
            enDiscusion={enDiscusion}
        />
    </div>
}