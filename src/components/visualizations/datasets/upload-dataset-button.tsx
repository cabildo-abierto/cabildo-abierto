import {styled} from "@mui/material";
import { Button } from "../../layout/utils/button";
import UploadFileIcon from "@/components/layout/icons/upload-file-icon";
import {useErrors} from "@/components/layout/error-context";


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


export const UploadDatasetButton = ({text="Subir archivo (.csv)", onSubmit}: {text?: string, onSubmit: (file: any, filename: string) => void}) => {
    const {addError} = useErrors()

    const loadDataset = async (e) => {
        if (e.target.files !== null && e.target.files.length > 0) {
            const file = e.target.files[0]
            if(file && file.type){
                onSubmit(new Blob([file], { type: file.type }), file.name)
            } else {
                addError("Ocurrió un error al cargar el conjunto de datos.")
            }
        }
    }
    return <Button
        component="label"
        variant="outlined"
        tabIndex={-1}
        size={"small"}
        disableElevation={true}
        startIcon={<UploadFileIcon/>}
    >
        <span className={"text-[13px]"}>{text}</span>
        <VisuallyHiddenInput
            type="file"
            onChange={loadDataset}
            multiple={false}
        />
    </Button>
}