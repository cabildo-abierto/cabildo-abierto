import {styled} from "@mui/material";
import {ImagePayload} from "@/components/writing/write-panel/write-post";
import { Button } from "../../layout/utils/button";
import {file2base64} from "@/utils/files";
import imageCompression from "browser-image-compression"
import UploadFileIcon from "@/components/layout/icons/upload-file-icon";


const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
})


export const UploadImageButton = ({onSubmit, text="Subir archivo"}: {text?: string, onSubmit: (i: ImagePayload) => void}) => {
    const loadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files !== null) {
            const file = e.target.files[0];
            if (file) {
                try {
                    const compressedFile = await imageCompression(file, {
                        maxSizeMB: 0.9,
                        useWebWorker: true,
                    });

                    const base64 = await file2base64(compressedFile);

                    onSubmit({
                        $type: "file",
                        src: URL.createObjectURL(compressedFile),
                        base64: base64.base64
                    })
                } catch (err) {
                    console.error("Image compression error:", err);
                }
            }
        }
    };


    return <Button
        component="label"
        role={undefined}
        variant="outlined"
        tabIndex={-1}
        disableElevation={true}
        startIcon={<UploadFileIcon weight={"light"} />}
        fullWidth={true}
    >
        <span className={"text-[13px]"}>
            {text}
        </span>
        <VisuallyHiddenInput
            type="file"
            accept={"image/*"}
            onChange={loadImage}
            multiple={false}
        />
    </Button>
}