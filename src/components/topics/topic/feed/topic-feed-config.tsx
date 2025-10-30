import {topicUrl} from "@/utils/uri";
import InfoPanel from "../../../layout/utils/info-panel";
import {ModalOnClick} from "../../../layout/utils/modal-on-click";
import {SlidersHorizontalIcon} from "@phosphor-icons/react";
import {TopicMentionsFeedConfig} from "@/components/topics/topic/feed/topic-mentions-feed-config";
import {BaseNotIconButton} from "@/components/layout/base/base-not-icon-button";

export type TopicFeedOption = "Menciones" | "Discusión" | "Otros temas"

export const TopicFeedConfig = ({selected}: { selected: TopicFeedOption }) => {

    const modal = (close: () => void) => (
        <div className={"p-3 space-y-2 w-56"}>
            <div className={"w-full flex justify-between items-center"}>
                <div className={"text-[13px] text-[var(--text)] uppercase"}>
                    Configurar <span className={"font-semibold text-[var(--text-light)]"}
                >
                    {selected}
                </span>
                </div>
                <InfoPanel
                    onClick={() => {
                        window.open(topicUrl("Cabildo Abierto: Muros"), "_blank")
                    }}
                    iconFontSize={18}
                />
            </div>
            <div>
                <TopicMentionsFeedConfig/>
            </div>
        </div>
    )

    return <ModalOnClick
        modal={modal}
    >
        <BaseNotIconButton id={"feed-config-button"}>
            <SlidersHorizontalIcon weight={"light"}/>
        </BaseNotIconButton>
    </ModalOnClick>
}