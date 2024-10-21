import { ContentProps } from "../app/lib/definitions"
import { AcceptButtonPanel } from "./accept-button-panel"
import { BaseFullscreenPopup } from "./base-fullscreen-popup"
import CopyUrlButton from "./copy-url-button"
import FacebookShareButton from "./facebook-share-button"
import XShareButton from "./twitter-share-button"
import { WhatsAppShareButton } from "./whatsapp-share-button"



export const SharePopup = ({onClose}: {onClose: () => void}) => {

    return <BaseFullscreenPopup
        closeButton={true}
        onClose={onClose}
    >
        <div className="flex flex-col items-center w-full px-6 pb-10">
            <h3>Compartir Cabildo Abierto</h3>

            <div className="flex flex-col items-center space-y-2 mt-4">
                <WhatsAppShareButton/>
                <XShareButton/>
                <FacebookShareButton/>
                <CopyUrlButton/>
            </div>
        </div>
    </BaseFullscreenPopup>
}