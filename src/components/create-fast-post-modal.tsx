import { BaseFullscreenPopup } from "./base-fullscreen-popup";
import { FullscreenDialog } from "./fullscreen-dialog";
import { WritePanelMainFeed } from "./write-panel-main-feed";
import useMedia from "use-media";

export const CreateFastPostModal = ({ onClose }: { onClose: () => void }) => {
    // Check if the screen width is less than 640px (small screen)
    const isSmallScreen = useMedia({ maxWidth: "640px" });

    return isSmallScreen ? (
        <FullscreenDialog>
            <WritePanelMainFeed onClose={onClose} mobile={true}/>
        </FullscreenDialog>
    ) : (
        <BaseFullscreenPopup className="w-128">
            <WritePanelMainFeed onClose={onClose} />
        </BaseFullscreenPopup>
    );
};
