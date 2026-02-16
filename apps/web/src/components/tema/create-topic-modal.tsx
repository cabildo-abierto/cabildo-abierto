import {BaseFullscreenPopup} from "../utils/dialogs/base-fullscreen-popup"
import {CreateTopic} from "../writing/write-panel/create-topic";


const CreateTopicModal = ({
                              open,
                              onClose,
    onBack,
    onMenu
}: {
    open: boolean,
    onClose: () => void
    onBack?: () => void
    onMenu: boolean
}) => {

    return <BaseFullscreenPopup
        open={open}
        closeButton={true}
        onClose={onClose}
        backgroundShadow={true}
        onBack={onBack}
    >
        <CreateTopic onClose={onClose} initialSelected={""} onMenu={onMenu}/>
    </BaseFullscreenPopup>
};


export default CreateTopicModal