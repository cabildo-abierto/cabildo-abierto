import {BaseFullscreenPopup} from "../../../../modules/ui-utils/src/base-fullscreen-popup";
import {useState} from "react";
import {LinkIcon} from "@/components/layout/icons/link-icon";
import {UploadImageButton} from "./upload-image-button";
import {InsertImageUriDialogBody} from "./insert-image-uri-modal";
import {ImagePayload} from "@/components/writing/write-panel/write-post";
import { Button } from "../../../../modules/ui-utils/src/button";

export type InsertImageModalProps = {
    open: boolean
    onClose: () => void;
    onSubmit: (i: ImagePayload) => void;
}

export const InsertImageModal = ({open, onClose, onSubmit}: InsertImageModalProps) => {
    const [mode, setMode] = useState<null | 'url' | 'file'>(null);

    return <BaseFullscreenPopup
        open={open}
        onClose={() => {onClose(); setMode(null)}}
        closeButton={true}
        backgroundShadow={false}
    >
        <div className={"flex flex-col items-center justify-center py-4 pb-8 w-96"}>
            {!mode &&
                <div className={"w-48 space-y-4"}>
                    <Button
                        variant="outlined"
                        disableElevation={true}
                        startIcon={<LinkIcon/>}
                        fullWidth={true}
                        onClick={() => setMode('url')}
                    >
                        <span className={"text-sm"}>Desde un URL</span>
                    </Button>
                    <UploadImageButton
                        onSubmit={onSubmit}
                    />
                </div>
            }
            {mode === 'url' &&
                <div className={"w-72 space-y-4 flex flex-col items-center"}>
                    <div className={"text-[var(--text-light)] text-sm"}>
                        Pegá el URL de una imágen.
                    </div>
                    <InsertImageUriDialogBody
                        onClick={(i: ImagePayload) => {onSubmit(i); setMode(null)}}
                    />
                </div>
            }
        </div>
    </BaseFullscreenPopup>
}