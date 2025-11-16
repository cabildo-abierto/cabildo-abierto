import {topicUrl} from "@/components/utils/react/url";
import InfoPanel from "@/components/utils/base/info-panel";
import {ModalOnClick} from "@/components/utils/base/modal-on-click";
import {SlidersHorizontalIcon} from "@phosphor-icons/react";
import {TopicMentionsFeedConfig} from "./topic-mentions-feed-config";
import {BaseNotIconButton} from "@/components/utils/base/base-not-icon-button";

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