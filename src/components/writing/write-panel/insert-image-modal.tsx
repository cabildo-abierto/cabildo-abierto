import {BaseFullscreenPopup} from "../../layout/base/base-fullscreen-popup";
import {useState} from "react";
import {LinkIcon} from "@/components/layout/icons/link-icon";
import {UploadImageButton} from "./upload-image-button";
import {InsertImageUriDialogBody} from "./insert-image-uri-modal";
import {ImagePayload} from "@/components/writing/write-panel/write-post";
import {BaseButton} from "../../layout/base/baseButton";

export type InsertImageModalProps = {
    open: boolean
    onClose: () => void;
    onSubmit: (i: ImagePayload) => void;
}

const InsertImageModal = ({open, onClose, onSubmit}: InsertImageModalProps) => {
    const [mode, setMode] = useState<null | 'url' | 'file'>(null);

    return <BaseFullscreenPopup
        open={open}
        onClose={() => {
            onClose();
            setMode(null)
        }}
        closeButton={true}
        backgroundShadow={false}
    >
        {!mode && <div className={"flex flex-col items-center justify-between space-y-4 pt-4 pb-8 px-8 w-96"}>
            <div className={"space-y-4 flex flex-col"}>
                <BaseButton
                    variant="outlined"
                    startIcon={<LinkIcon weight={"light"}/>}
                    onClick={() => setMode('url')}
                >
                    Usar un URL
                </BaseButton>
                <UploadImageButton
                    onSubmit={onSubmit}
                />
            </div>
        </div>}
        {mode === 'url' &&
            <InsertImageUriDialogBody
                onClick={(i: ImagePayload) => {
                    onSubmit(i);
                    setMode(null)
                }}
                onCancel={() => {setMode(null)}}
            />
        }
    </BaseFullscreenPopup>
}


export default InsertImageModal