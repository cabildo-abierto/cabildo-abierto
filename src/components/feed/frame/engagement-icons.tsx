import {ContentOptionsButton} from "@/components/feed/content-options/content-options-button"
import {InactiveCommentIcon} from "../../icons/inactive-comment-icon"
import {FixedCounter} from "./reaction-counter"
import {contentUrl, getCollectionFromUri} from "@/utils/uri";
import {ArticleView, FullArticleView, isArticleView, PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs"
import React, {useState} from "react";
import {$Typed} from "@atproto/api";
import {RepostCounter} from "@/components/feed/frame/repost-counter";
import {LikeCounter} from "@/components/feed/frame/like-counter";
import WritePanel from "@/components/writing/write-panel/write-panel";
import {useRouter} from "next/navigation";

type EngagementIconsProps = {
    content: $Typed<PostView> | $Typed<ArticleView> | $Typed<FullArticleView>
    className?: string
    small?: boolean
    enDiscusion?: boolean
}



export const EngagementIcons = ({
                                    content,
                                    className = "space-x-16",
                                    enDiscusion
                                }: EngagementIconsProps) => {
    const [showBsky, setShowBsky] = useState(false)
    const [writingReply, setWritingReply] = useState<boolean>(false)
    const router = useRouter()

    const onClickRepliesButton = () => {
        if (isArticleView(content)) {
            router.push(contentUrl(content.uri))
        } else {
            setWritingReply(true)
        }
    }

    return <div className={"flex items-center exclude-links w-full " + className}>
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
            {content.likeCount != undefined && <LikeCounter content={content} showBsky={showBsky}/>}
        </>}

        <ContentOptionsButton
            record={content}
            enDiscusion={enDiscusion}
            showBluesky={showBsky}
            setShowBluesky={setShowBsky}
        />
        <WritePanel
            open={writingReply}
            onClose={() => {
                setWritingReply(false)
            }}
            replyTo={content}
        />
    </div>
}