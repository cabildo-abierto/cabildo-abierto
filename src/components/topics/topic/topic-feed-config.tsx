import {topicUrl} from "@/utils/uri";
import InfoPanel from "../../layout/utils/info-panel";
import {useRef} from "react";
import {ClickableModalOnClick} from "../../layout/utils/popover";
import {SlidersHorizontalIcon} from "@phosphor-icons/react";
import {TopicFeedOption} from "@/components/topics/topic2/topic-page";
import {TopicMentionsFeedConfig} from "@/components/topics/topic/topic-mentions-feed-config";

export const TopicFeedConfig = ({selected}: { selected: TopicFeedOption }) => {
    const buttonRef = useRef<HTMLButtonElement>(null)

    const modal = (close: () => void) => (
        <div className={"p-3 space-y-2 w-56"}>
            <div className={"w-full flex justify-between items-end"}>
                <div className={"text-[13px] text-[var(--text)] uppercase"}>
                    Configurar <span className={"font-semibold text-[var(--text-light)]"}
                >
                    {selected}
                </span>
                </div>
                <InfoPanel onClick={() => {
                    window.open(topicUrl("Cabildo Abierto: Muros"), "_blank")
                }}/>
            </div>
            <div>
                <TopicMentionsFeedConfig/>
            </div>
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