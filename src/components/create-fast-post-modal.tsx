import { BaseFullscreenPopup } from "./base-fullscreen-popup";
import { WritePanelMainFeed } from "./write-panel-main-feed";



export const CreateFastPostModal = ({ onClose }: { onClose: () => void }) => {

    return <BaseFullscreenPopup>
        <div className="w-[315px] sm:w-128">
            <WritePanelMainFeed onClose={onClose}/>
        </div>
    </BaseFullscreenPopup>
};