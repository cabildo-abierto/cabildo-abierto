import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {styled} from "@mui/material";
import {InsertImagePayload} from "../../../../modules/ca-lexical-editor/src/plugins/ImagesPlugin";



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


export const UploadImageButton = ({onSubmit}: {onSubmit: (i: {src?: string, formData?: FormData}) => void}) => {
    const loadImage = async (e: any) => {
        if (e.target.files !== null) {
            const file = e.target.files[0]
            if (file) {
                const imageUrl = URL.createObjectURL(file)
                const formData = new FormData()
                formData.set("image", file)
                onSubmit({
                    src: imageUrl,
                    formData
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
        Subir archivo
        <VisuallyHiddenInput
            type="file"
            onChange={loadImage}
            multiple={false}
        />
    </Button>
}