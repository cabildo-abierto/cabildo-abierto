import {BaseFullscreenPopup} from "@/components/layout/base/base-fullscreen-popup";
import {CloseButton} from "@/components/layout/utils/close-button";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {TopicView} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {EditHistory} from "@/components/topics/topic/history/edit-history";


export const TopicHistoryPanel = ({onClose, topic}: {
    onClose: () => void
    topic: TopicView
}) => {
    const {isMobile} = useLayoutConfig()
    return <BaseFullscreenPopup
        open={true}
        className={"z-[1500] sm:w-auto"}
    >
        <div className={(!isMobile ? "w-[600px] pb-1" : "")}>
            <div className={"flex justify-between items-center p-2"}>
                <div className={"font-semibold uppercase text-sm"}>
                    Historial
                </div>
                <CloseButton onClose={onClose} size={"small"}/>
            </div>
            <EditHistory
                topic={topic}
                className={"max-h-[70vh] overflow-y-auto custom-scrollbar"}
                onClose={onClose}
            />
        </div>
    </BaseFullscreenPopup>

}