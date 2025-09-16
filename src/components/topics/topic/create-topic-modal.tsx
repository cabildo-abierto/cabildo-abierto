import { BaseFullscreenPopup } from "../../../../modules/ui-utils/src/base-fullscreen-popup";
import {CreateTopic} from "../../writing/write-panel/create-topic";



const CreateTopicModal = ({ open, onClose }: { open: boolean, onClose: () => void }) => {

    return <BaseFullscreenPopup
        open={open}
        closeButton={true}
        onClose={onClose}
        backgroundShadow={false}
        color={"background"}
    >
        <CreateTopic onClose={onClose} initialSelected={""} backButton={false}/>
    </BaseFullscreenPopup>
};


export default CreateTopicModal