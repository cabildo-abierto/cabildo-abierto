import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {styled} from "@mui/material";
import {ImagePayload} from "@/components/writing/write-panel/write-post";
import { Button } from "../../../../modules/ui-utils/src/button";



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
    const loadImage = async (e: any) => {
        if (e.target.files !== null) {
            const file = e.target.files[0]
            if (file) {
                const arrayBuffer = await file.arrayBuffer();

                onSubmit({
                    $type: "file",
                    src: URL.createObjectURL(file),
                    base64: Buffer.from(arrayBuffer).toString("base64")
                })
            }
        }
    }

    return <Button
        component="label"
        role={undefined}
        variant="contained"
        tabIndex={-1}
        sx={{textTransform: "none"}}
        disableElevation={true}
        startIcon={<CloudUploadIcon />}
        fullWidth={true}
    >
        {text}
        <VisuallyHiddenInput
            type="file"
            onChange={loadImage}
            multiple={false}
        />
    </Button>
}