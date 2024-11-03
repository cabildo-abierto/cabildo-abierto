import { BaseFullscreenPopup } from "./base-fullscreen-popup";
import { WritePanelMainFeed } from "./write-panel-main-feed";



export const CreateFastPostModal = ({ onClose }: { onClose: () => void }) => {

    return <BaseFullscreenPopup className="px-1 sm:w-128 w-[98vh]">
        <WritePanelMainFeed onClose={onClose}/>
    </BaseFullscreenPopup>
};