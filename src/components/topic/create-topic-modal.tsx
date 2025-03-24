import { BaseFullscreenPopup } from "../ui-utils/base-fullscreen-popup";
import {CreateTopic} from "../writing/create-topic";



export const CreateTopicModal = ({ open, onClose }: { open: boolean, onClose: () => void }) => {

    return <BaseFullscreenPopup open={open} closeButton={true} onClose={onClose}>
        <CreateTopic onClose={onClose} initialSelected={""}/>
    </BaseFullscreenPopup>
};