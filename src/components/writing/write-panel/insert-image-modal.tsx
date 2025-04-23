import {BaseFullscreenPopup} from "../../../../modules/ui-utils/src/base-fullscreen-popup";
import {useState} from "react";
import Button from "@mui/material/Button";
import {LinkIcon} from "../../icons/link-icon";
import {UploadImageButton} from "./upload-image-button";
import {InsertImageUriDialogBody} from "./insert-image-uri-modal";



export const InsertImageModal = ({open, onClose, onSubmit}: {
    open: boolean
    onClose: () => void;
    onSubmit: (i: { src?: string, formData?: FormData }) => void;
}) => {
    const [mode, setMode] = useState<null | 'url' | 'file'>(null);


    return <BaseFullscreenPopup
        open={open}
        className={"w-96"}
        onClose={() => {onClose(); setMode(null)}} closeButton={true}
    >
        <div className={"flex flex-col items-center justify-center py-4 pb-8"}>
            {!mode &&
                <div className={"w-48 space-y-4"}>
                    <Button
                        variant="contained"
                        sx={{textTransform: "none"}}
                        disableElevation={true}
                        startIcon={<LinkIcon/>}
                        fullWidth={true}
                        onClick={() => setMode('url')}>
                        Desde un URL
                    </Button>
                    <UploadImageButton
                        onSubmit={onSubmit}
                    />
                </div>
            }
            {mode === 'url' &&
                <div className={"w-72 space-y-4 flex flex-col items-center"}>
                    <div className={"text-[var(--text-light)]"}>
                        Pegá el URL de una imágen.
                    </div>
                    <InsertImageUriDialogBody
                        onClick={(i: {src: string}) => {onSubmit(i); setMode(null)}}
                    />
                </div>
            }
        </div>
    </BaseFullscreenPopup>
}