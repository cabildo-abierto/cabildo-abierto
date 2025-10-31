import { BaseFullscreenPopup } from "../../layout/base/base-fullscreen-popup";
import {CreateTopic} from "../../writing/write-panel/create-topic";



const CreateTopicModal = ({ open, onClose }: { open: boolean, onClose: () => void }) => {

    return <BaseFullscreenPopup
        open={open}
        closeButton={true}
        onClose={onClose}
        backgroundShadow={true}
        className={"z-[1050] sm:w-auto"}
    >
        <CreateTopic onClose={onClose} initialSelected={""}/>
    </BaseFullscreenPopup>
};


export default CreateTopicModal