import { BaseFullscreenPopup } from "./base-fullscreen-popup";
import { WritePanelMainFeed } from "./write-panel-main-feed";

export const CreateFastPostModal = ({ open, onClose }: { open: boolean, onClose: () => void }) => {

    return <BaseFullscreenPopup open={open} className="w-128">
        <WritePanelMainFeed onClose={onClose} />
    </BaseFullscreenPopup>
};
