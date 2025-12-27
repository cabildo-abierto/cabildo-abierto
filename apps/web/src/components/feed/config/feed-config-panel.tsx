import InfoPanel from "@/components/utils/base/info-panel";
import {topicUrl} from "@/components/utils/react/url";
import {EnDiscusionFeedConfig} from "./en-discusion";
import {FollowingFeedConfig} from "./following-feed-config";
import {DiscoverFeedConfig} from "./discover-feed-config";
import {useLayoutConfig} from "../../layout/main-layout/layout-config-context";
import {useTopbarHeight} from "../../layout/main-layout/topbar/topbar-height";
import {cn} from "@/lib/utils";
import {useMainPageFeeds} from "@/components/feed/config/main-page-feeds-context";
import {BaseIconButton} from "@/components/utils/base/base-icon-button";
import {CaretUpIcon} from "@phosphor-icons/react";
import {TopicMentionsFeedConfig} from "@/components/tema/feed/topic-mentions-feed-config";
import {Paragraph} from "@/components/utils/base/paragraph";
import BskyRichTextContent from "@/components/feed/post/bsky-rich-text-content";
import {getFeedDescriptionFromConfig} from "@/components/feed/utils/use-feed-description";


export const FeedConfigPanel = ({onClose, configOpen}: { onClose: () => void, configOpen: boolean }) => {
    const {layoutConfig, isMobile} = useLayoutConfig()
    const topbarHeight = useTopbarHeight()
    const {config} = useMainPageFeeds()
    const {description} = getFeedDescriptionFromConfig(config)

    if(!config) return null

    return (
        <>
            <div
                className={cn(
                    "fixed w-full left-0 pointer-events-none transition-opacity duration-300",
                    configOpen ? "opacity-100" : "opacity-0"
                )}
                style={{
                    paddingLeft: layoutConfig.spaceForLeftSide
                        ? layoutConfig.widthLeftSide
                        : layoutConfig.spaceForMinimizedLeftSide
                            ? layoutConfig.widthLeftSideSmall
                            : 0,
                    paddingRight:
                        layoutConfig.spaceForRightSide && layoutConfig.openRightPanel
                            ? layoutConfig.widthRightSide
                            : 0,
                    top: topbarHeight,
                }}
            >
                <div className="flex justify-center">
                    <div
                        className={cn(
                            `
                            pointer-events-auto mt-2 border-t z-[1300] p-3 space-y-2 
                            bg-[var(--background-dark)] shadow
                            border-[var(--accent-dark)] border-b transition-all duration-300 ease-in-out
                            opacity-0 -translate-y-2 
                            `,
                            configOpen ? "opacity-100 translate-y-0" : "pointer-events-none",
                            !isMobile && "border-l border-r"
                        )}
                        style={{width: layoutConfig.centerWidth}}
                    >
                        <div>
                            {description && <BskyRichTextContent
                                className={"text-[15px] text-[var(--text-light)] text-sm max-w-[480px] break-words"}
                                post={{text: description}}
                            />}
                        </div>
                        {config.subtype == "discusion" && <EnDiscusionFeedConfig />}
                        {config.subtype == "siguiendo" && <FollowingFeedConfig />}
                        {config.subtype == "descubrir" && <DiscoverFeedConfig />}
                        {config.subtype == "custom" && <Paragraph className={"text-sm"}>
                            Este muro no tiene ninguna configuración disponible.
                        </Paragraph>}
                        {config.type == "topic" && config.subtype == "mentions" && <TopicMentionsFeedConfig/>}

                        <div className="w-full flex justify-end items-center space-x-2">
                            <InfoPanel
                                onClick={() =>
                                    window.open(topicUrl("Cabildo Abierto: Muros"), "_blank")
                                }
                                iconFontSize={18}
                            />
                            <BaseIconButton
                                onClick={onClose}
                                className={"rounded-full bg-[var(--background-dark2)] hover:bg-[var(--background-dark3)] p-[2px]"}
                                size={"small"}
                            >
                                <CaretUpIcon/>
                            </BaseIconButton>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}