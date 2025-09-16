import {SlidersHorizontalIcon} from "@phosphor-icons/react";
import {useRef} from "react";
import InfoPanel from "../../../modules/ui-utils/src/info-panel";
import {topicUrl} from "@/utils/uri";
import {ClickableModalOnClick} from "../../../modules/ui-utils/src/popover";
import {EnDiscusionFeedConfig} from "@/components/config/en-discusion";
import {FollowingFeedConfig} from "@/components/config/following-feed-config";
import {MainFeedOption} from "@/lib/types";

export const FeedConfig = ({selected}: { selected: MainFeedOption }) => {
    const buttonRef = useRef<HTMLButtonElement>(null)

    const modal = (close: () => void) => (
        <div className={"p-3 space-y-2 bg-[var(--background)] uppercase w-56"}>
            <div className={"w-full flex justify-between items-end"}>
                <div className={"text-[13px] text-[var(--text)]"}>
                    Configurar <span className={"font-semibold text-[var(--text-light)]"}
                >
                    {selected}
                </span>
                </div>
                <InfoPanel onClick={() => {
                    window.open(topicUrl("Cabildo Abierto: Muros"), "_blank")
                }}/>
            </div>
            {selected == "En discusión" && <EnDiscusionFeedConfig/>}
            {selected == "Siguiendo" && <FollowingFeedConfig/>}
        </div>
    )

    return <ClickableModalOnClick
        modal={modal}
        id={"feed-config"}
    >
        <button id="feed-config-button" ref={buttonRef} className={"hover:bg-[var(--background-dark)] rounded p-1"}>
            <SlidersHorizontalIcon size={22} weight={"light"}/>
        </button>
    </ClickableModalOnClick>
}