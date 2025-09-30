import {ContentOptionsButton} from "@/components/feed/content-options/content-options-button"
import {InactiveCommentIcon} from "@/components/layout/icons/inactive-comment-icon"
import {ReplyCounter} from "./reply-counter"
import {contentUrl, getCollectionFromUri} from "@/utils/uri";
import React, {useState} from "react";
import {$Typed} from "@/lex-api/util";
import {RepostCounter} from "@/components/feed/frame/repost-counter";
import {LikeCounter} from "@/components/feed/frame/like-counter";
import {useRouter} from "next/navigation";
import dynamic from "next/dynamic";
import {ArCabildoabiertoFeedDefs} from "@/lex-api/index"
import {useSession} from "@/queries/getters/useSession";
import {useLoginModal} from "@/components/layout/login-modal-provider";

const WritePanel = dynamic(() => import('@/components/writing/write-panel/write-panel'), {
    ssr: false
})
import {EngagementDetails} from "@/components/feed/frame/engagement-details";
import { Color } from "../../../../modules/ui-utils/src/color";


type EngagementIconsProps = {
    content: $Typed<ArCabildoabiertoFeedDefs.PostView> | $Typed<ArCabildoabiertoFeedDefs.ArticleView> | $Typed<ArCabildoabiertoFeedDefs.FullArticleView>
    className?: string
    small?: boolean
    enDiscusion?: boolean
    showDetails?: boolean
    iconFontSize?: number
    textClassName?: string
    iconHoverColor?: Color
}


export const EngagementIcons = ({
    content,
    className = "space-x-16",
    iconFontSize = 22,
    enDiscusion,
    showDetails = false,
    textClassName,
    iconHoverColor = "background-dark"
}: EngagementIconsProps) => {
    const [showBsky, setShowBsky] = useState(false)
    const [writingReply, setWritingReply] = useState<boolean>(false)
    const router = useRouter()
    const {setLoginModalOpen} = useLoginModal()
    const {user} = useSession()

    const onClickRepliesButton = () => {
        if (ArCabildoabiertoFeedDefs.isArticleView(content)) {
            router.push(contentUrl(content.uri))
        } else {
            if(user){
                setWritingReply(true)
            } else {
                setLoginModalOpen(true)
            }
        }
    }

    return <div>
        {showDetails && <EngagementDetails
            content={content}
            showBsky={showBsky}
            small={true}
        />}

        <div className={"flex items-center justify-between exclude-links w-full pt-1 " + className}>
            {getCollectionFromUri(content.uri) != "ar.cabildoabierto.wiki.topicVersion" && <>
                {content.replyCount != undefined && <div className={"flex-1"}><ReplyCounter
                    count={content.replyCount}
                    icon={<InactiveCommentIcon color="var(--text)" fontSize={iconFontSize}/>}
                    title="Cantidad de respuestas."
                    onClick={onClickRepliesButton}
                    disabled={content.uri.includes("optimistic")}
                    hoverColor={iconHoverColor}
                    textClassName={textClassName}
                /></div>}
                {content.repostCount != undefined && <div className={"flex-1"}><RepostCounter
                    content={content}
                    showBsky={showBsky}
                    repostUri={content.viewer ? content.viewer.repost : undefined}
                    iconFontSize={iconFontSize}
                    textClassName={textClassName}
                    hoverColor={iconHoverColor}
                /></div>}
                {content.likeCount != undefined && <div className={"flex-1"}><LikeCounter
                    content={content}
                    showBsky={showBsky}
                    iconFontSize={iconFontSize}
                    textClassName={textClassName}
                    hoverColor={iconHoverColor}
                /></div>}
            </>}

            <ContentOptionsButton
                record={content}
                enDiscusion={enDiscusion}
                showBluesky={showBsky}
                setShowBluesky={setShowBsky}
                iconFontSize={iconFontSize}
                iconHoverColor={iconHoverColor}
            />
            {writingReply && user && <WritePanel
                open={writingReply}
                onClose={() => {
                    setWritingReply(false)
                }}
                replyTo={content}
            />}
        </div>
    </div>
}