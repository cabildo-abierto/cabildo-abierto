import {useErrors} from "../../../layout/contexts/error-context";
import {useRef} from "react";
import {BaseButton} from "@/components/utils/base/base-button";
import UploadFileIcon from "@/components/utils/icons/upload-file-icon";

export const UploadDatasetButton = ({text = "Subir archivo (.csv)", onSubmit}: {
    text?: string,
    onSubmit: (file: any, filename: string) => void
}) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const {addError} = useErrors()

    const loadDataset = async (e) => {
        if (e.target.files !== null && e.target.files.length > 0) {
            const file = e.target.files[0]
            if (file && file.type) {
                onSubmit(new Blob([file], {type: file.type}), file.name)
            } else {
                addError("Ocurrió un error al cargar el conjunto de datos.")
            }
        }
    }
    return <BaseButton
        variant="outlined"
        tabIndex={-1}
        size={"small"}
        startIcon={<UploadFileIcon/>}
        onClick={e => {inputRef.current.click()}}
    >
        {text}
        <input
            className={"hidden"}
            ref={inputRef}
            type={"file"}
            onChange={loadDataset}
            multiple={false}
        />
    </BaseButton>
}