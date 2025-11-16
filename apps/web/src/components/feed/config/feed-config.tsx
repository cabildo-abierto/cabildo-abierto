import {CaretDownIcon, CaretUpIcon} from "@phosphor-icons/react";
import {useRef, useState} from "react";
import InfoPanel from "@/components/utils/base/info-panel";
import {topicUrl} from "@/components/utils/react/url";
import {EnDiscusionFeedConfig} from "./en-discusion";
import {FollowingFeedConfig} from "./following-feed-config";
import {MainFeedOption} from "@/lib/types";
import {DiscoverFeedConfig} from "./discover-feed-config";
import {BaseIconButton} from "@/components/utils/base/base-icon-button";
import {useLayoutConfig} from "../../layout/main-layout/layout-config-context";
import {useTopbarHeight} from "../../layout/main-layout/topbar/topbar-height";
import {cn} from "@/lib/utils";


export const FeedConfig = ({selected}: { selected: MainFeedOption }) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const {layoutConfig, isMobile} = useLayoutConfig()
    const [open, setOpen] = useState(false);
    const topbarHeight = useTopbarHeight()

    return <>
        <BaseIconButton
            id="feed-config-button"
            ref={buttonRef}
            className={"hover:bg-[var(--background-dark)] p-1"}
            onClick={() => {setOpen(!open)}}
        >
            {!open && <CaretDownIcon size={22} weight={"light"}/>}
            {open && <CaretUpIcon size={22} weight={"light"}/>}
        </BaseIconButton>
        {open && <div
            className={"pointer-events-none fixed w-screen left-0"}
            style={{
                paddingLeft: layoutConfig.widthLeftSide,
                paddingRight: layoutConfig.widthRightSide,
                top: topbarHeight
            }}
        >
            <div className={"flex justify-center w-full"}>
                <div
                    className={cn("pointer-events-auto z-[1300] p-3 space-y-2 bg-[var(--background)] shadow border-[var(--accent-dark)] border-b", !isMobile && "border-l border-r")}
                    style={{width: layoutConfig.maxWidthCenter}}
                >
                    {selected == "En discusión" && <EnDiscusionFeedConfig/>}
                    {selected == "Siguiendo" && <FollowingFeedConfig/>}
                    {selected == "Descubrir" && <DiscoverFeedConfig/>}
                    <div
                        className={"w-full flex justify-end items-center"}
                    >
                        <div>
                            <InfoPanel
                                onClick={() => {
                                    window.open(topicUrl("Cabildo Abierto: Muros"), "_blank")
                                }}
                                iconFontSize={18}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>}
    </>
}