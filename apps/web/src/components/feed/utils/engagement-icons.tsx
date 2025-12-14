import {ContentOptionsButton} from "@/components/feed/options/content-options-button"
import {ReplyCounter} from "./reply-counter"
import {getCollectionFromUri} from "@cabildo-abierto/utils";
import React, {useState} from "react";
import {$Typed} from "@cabildo-abierto/api";
import {RepostCounter} from "./repost-counter";
import {LikeCounter} from "./like-counter";
import {ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api"
import {EngagementDetails} from "./engagement-details";
import {BaseButtonProps} from "@/components/utils/base/base-button";
import {cn} from "@/lib/utils";


type EngagementIconsProps = {
    content: $Typed<ArCabildoabiertoFeedDefs.PostView> | $Typed<ArCabildoabiertoFeedDefs.ArticleView> | $Typed<ArCabildoabiertoFeedDefs.FullArticleView>
    className?: string
    small?: boolean
    enDiscusion?: boolean
    showDetails?: boolean
    iconSize?: BaseButtonProps["size"]
    textClassName?: string
}


export const EngagementIcons = ({
                                    content,
                                    className = "space-x-16",
                                    iconSize="default",
                                    enDiscusion,
                                    showDetails = false,
                                    textClassName
                                }: EngagementIconsProps) => {
    const [showBsky, setShowBsky] = useState(false)

    return <div>
        {showDetails && <EngagementDetails
            content={content}
            showBsky={showBsky}
            small={true}
        />}

        <div
            className={cn("portal group flex items-center exclude-links w-full pt-1", className)}
        >
            {getCollectionFromUri(content.uri) != "ar.cabildoabierto.wiki.topicVersion" && <>
                {content.replyCount != undefined && <div className={"flex-1"}>
                    <ReplyCounter
                        count={content.replyCount}
                        disabled={content.uri.includes("optimistic")}
                        textClassName={textClassName}
                        content={content}
                        iconSize={iconSize}
                    />
                </div>}
                {content.repostCount != undefined && <div className={"flex-1"}>
                    <RepostCounter
                        content={content}
                        showBsky={showBsky}
                        repostUri={content.viewer ? content.viewer.repost : undefined}
                        iconSize={iconSize}
                        textClassName={textClassName}
                    />
                </div>}
                {content.likeCount != undefined && <div className={"flex-1"}>
                    <LikeCounter
                        content={content}
                        showBsky={showBsky}
                        iconSize={iconSize}
                        textClassName={textClassName}
                    />
                </div>}
            </>}

            <ContentOptionsButton
                record={content}
                enDiscusion={enDiscusion}
                showBluesky={showBsky}
                setShowBluesky={setShowBsky}
                iconSize={iconSize}
            />
        </div>
    </div>
}