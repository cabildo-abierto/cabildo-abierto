import {ContentOptionsButton} from "@/components/feed/content-options/content-options-button"
import {InactiveCommentIcon} from "@/components/layout/icons/inactive-comment-icon"
import {FixedCounter} from "./reaction-counter"
import {contentUrl, getCollectionFromUri} from "@/utils/uri";
import React, {useState} from "react";
import {$Typed} from "@/lex-api/util";
import {RepostCounter} from "@/components/feed/frame/repost-counter";
import {LikeCounter} from "@/components/feed/frame/like-counter";
import {useRouter} from "next/navigation";
import dynamic from "next/dynamic";
import {ArCabildoabiertoFeedDefs} from "@/lex-api/index"
import {useSession} from "@/queries/useSession";
import {useLoginModal} from "@/components/layout/login-modal-provider";

const WritePanel = dynamic(() => import('@/components/writing/write-panel/write-panel'), {
    ssr: false
})
import {EngagementDetails} from "@/components/feed/frame/engagement-details";


type EngagementIconsProps = {
    content: $Typed<ArCabildoabiertoFeedDefs.PostView> | $Typed<ArCabildoabiertoFeedDefs.ArticleView> | $Typed<ArCabildoabiertoFeedDefs.FullArticleView>
    className?: string
    small?: boolean
    enDiscusion?: boolean
    showDetails?: boolean
}


export const EngagementIcons = ({
    content,
    className = "space-x-16",
    enDiscusion,
    showDetails = false
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

        <div className={"flex items-center exclude-links w-full "}>
            {showDetails && <EngagementDetails
                content={content}
                showBsky={showBsky}
                small={true}
            />}
        </div>

        <div className={"flex items-center space-x-16 exclude-links w-full " + className}>
            {getCollectionFromUri(content.uri) != "ar.cabildoabierto.wiki.topicVersion" && <>
                {content.replyCount != undefined && <FixedCounter
                    count={content.replyCount}
                    icon={<InactiveCommentIcon/>}
                    title="Cantidad de respuestas."
                    onClick={onClickRepliesButton}
                    disabled={content.uri.includes("optimistic")}
                />}
                {content.repostCount != undefined && <RepostCounter
                    content={content}
                    showBsky={showBsky}
                    reactionUri={content.viewer ? content.viewer.repost : undefined}
                />}
                {content.likeCount != undefined && <LikeCounter
                    content={content}
                    showBsky={showBsky}
                />}
            </>}

            <ContentOptionsButton
                record={content}
                enDiscusion={enDiscusion}
                showBluesky={showBsky}
                setShowBluesky={setShowBsky}
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