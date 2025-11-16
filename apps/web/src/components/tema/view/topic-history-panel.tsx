import {BaseFullscreenPopup} from "../../utils/dialogs/base-fullscreen-popup";
import {CloseButton} from "@/components/utils/base/close-button";
import {useLayoutConfig} from "../../layout/main-layout/layout-config-context";
import {ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api"
import {EditHistory} from "../history/edit-history";


export const TopicHistoryPanel = ({onClose, topic}: {
    onClose: () => void
    topic: ArCabildoabiertoWikiTopicVersion.TopicView
}) => {
    const {isMobile} = useLayoutConfig()
    return <BaseFullscreenPopup
        open={true}
        className={"z-[1500]"}
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