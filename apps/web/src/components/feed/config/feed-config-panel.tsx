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


export const FeedConfigPanel = ({onClose, configOpen}: { onClose: () => void, configOpen: boolean }) => {
    const {layoutConfig, isMobile} = useLayoutConfig()
    const topbarHeight = useTopbarHeight()
    const {config} = useMainPageFeeds()

    return (
        <>
            <div
                className={cn("pointer-events-none fixed w-full left-0", !configOpen && "hidden")}
                style={{
                    paddingLeft: layoutConfig.spaceForLeftSide ? layoutConfig.widthLeftSide : (layoutConfig.spaceForMinimizedLeftSide ? layoutConfig.widthLeftSideSmall : 0),
                    paddingRight: layoutConfig.spaceForRightSide && layoutConfig.openRightPanel ? layoutConfig.widthRightSide : 0,
                    top: topbarHeight
                }}
            >
                <div className="flex justify-center">
                    <div
                        className={cn(
                            `
                            pointer-events-auto z-[1300] p-3 space-y-2 
                            bg-[var(--background)] shadow
                            border-[var(--accent-dark)] border-b transition-all duration-300 ease-in-out
                            opacity-0 -translate-y-2 
                            `,
                            configOpen && "opacity-100 translate-y-0",
                            !isMobile && "border-l border-r"
                        )}
                        style={{width: layoutConfig.centerWidth}}
                    >
                        {config.subtype == "discusion" && <EnDiscusionFeedConfig />}
                        {config.subtype == "siguiendo" && <FollowingFeedConfig />}
                        {config.subtype == "descubrir" && <DiscoverFeedConfig />}

                        <div className="w-full flex justify-end items-center space-x-2">
                            <InfoPanel
                                onClick={() =>
                                    window.open(topicUrl("Cabildo Abierto: Muros"), "_blank")
                                }
                                iconFontSize={18}
                            />
                            <BaseIconButton onClick={onClose} className={"rounded-full bg-[var(--background-dark2)] hover:bg-[var(--background-dark3)] p-[2px]"} size={"small"}>
                                <CaretUpIcon/>
                            </BaseIconButton>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}