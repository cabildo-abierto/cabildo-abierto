import { BaseFullscreenPopup } from "./base-fullscreen-popup";
import { FullscreenDialog } from "./fullscreen-dialog";
import { WritePanelMainFeed } from "./write-panel-main-feed";

export const CreateFastPostModal = ({ onClose }: { onClose: () => void }) => {

    return <BaseFullscreenPopup className="w-128">
        <WritePanelMainFeed onClose={onClose} />
    </BaseFullscreenPopup>
};
