import {ContentOptionsButton} from "@/components/layout/options/content-options-button"
import {ReplyCounter} from "./reply-counter"
import {getCollectionFromUri} from "@/utils/uri";
import React, {useState} from "react";
import {$Typed} from "@/lex-api/util";
import {RepostCounter} from "@/components/feed/frame/repost-counter";
import {LikeCounter} from "@/components/feed/frame/like-counter";
import {ArCabildoabiertoFeedDefs} from "@/lex-api/index"
import {EngagementDetails} from "@/components/feed/frame/engagement-details";
import {Color} from "../../layout/utils/color";


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

    return <div>
        {showDetails && <EngagementDetails
            content={content}
            showBsky={showBsky}
            small={true}
        />}

        <div className={"flex items-center justify-between exclude-links w-full pt-1 " + className}>
            {getCollectionFromUri(content.uri) != "ar.cabildoabierto.wiki.topicVersion" && <>
                {content.replyCount != undefined && <div className={"flex-1"}>
                    <ReplyCounter
                        count={content.replyCount}
                        disabled={content.uri.includes("optimistic")}
                        hoverColor={iconHoverColor}
                        textClassName={textClassName}
                        content={content}
                        iconFontSize={iconFontSize}
                    />
                </div>}
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
        </div>
    </div>
}