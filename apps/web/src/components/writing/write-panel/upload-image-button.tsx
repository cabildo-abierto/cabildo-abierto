import {ImagePayload} from "./write-post";
import {file2base64} from "../../utils/react/files";
import imageCompression from "browser-image-compression"
import UploadFileIcon from "@/components/utils/icons/upload-file-icon";
import {ChangeEvent, useRef} from "react";
import {BaseButton} from "@/components/utils/base/base-button";


type SubmitImage = (i: ImagePayload) => void


export function useLoadImage(onSubmit: SubmitImage) {
    return async (e: ChangeEvent<HTMLInputElement>) => {
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
    }
}

export const UploadImageButton = ({
                                      onSubmit,
                                      text = "Subir archivo"
                                  }: {
    text?: string,
    onSubmit: SubmitImage
}) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const loadImage = useLoadImage(onSubmit)

    const handleButtonClick = () => {
        if (inputRef.current) {
            inputRef.current.click()
        }
    }

    return <BaseButton
        variant="outlined"
        tabIndex={-1}
        startIcon={<UploadFileIcon weight={"light"}/>}
        onClick={handleButtonClick}
    >
        {text}
        <input
            ref={inputRef}
            className={"hidden"}
            type={"file"}
            accept={"image/*"}
            onChange={loadImage}
            multiple={false}
        />
    </BaseButton>
}