import {SlidersHorizontalIcon} from "@phosphor-icons/react";
import {useRef} from "react";
import InfoPanel from "../layout/utils/info-panel";
import {topicUrl} from "@/utils/uri";
import {EnDiscusionFeedConfig} from "@/components/config/en-discusion";
import {FollowingFeedConfig} from "@/components/config/following-feed-config";
import {MainFeedOption} from "@/lib/types";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"


export const FeedConfig = ({selected}: { selected: MainFeedOption }) => {
    const buttonRef = useRef<HTMLButtonElement>(null)


    return <Popover>
        <PopoverTrigger asChild>
            <button id="feed-config-button" ref={buttonRef} className={"hover:bg-[var(--background-dark)] p-1"}>
                <SlidersHorizontalIcon size={22} weight={"light"}/>
            </button>
        </PopoverTrigger>
        <PopoverContent align={"start"} className={"z-[1002]"}>
            <div className={"p-3 space-y-2 uppercase w-56"}>
                <div className={"w-full flex justify-between items-center"}>
                    <div className={"text-[13px] text-[var(--text)]"}>
                        Configurar <span className={"font-semibold text-[var(--text-light)]"}
                    >
                            {selected}
                        </span>
                    </div>
                    <div>
                        <InfoPanel
                            onClick={() => {
                                window.open(topicUrl("Cabildo Abierto: Muros"), "_blank")
                            }}
                            iconFontSize={18}
                        />
                    </div>
                </div>
                {selected == "En discusión" && <EnDiscusionFeedConfig/>}
                {selected == "Siguiendo" && <FollowingFeedConfig/>}
            </div>
        </PopoverContent>
    </Popover>
}