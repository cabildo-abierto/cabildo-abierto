import {Button} from "./button";
import {CloudArrowUpIcon} from "@phosphor-icons/react";
import {ReactNode} from "react";
import {styled} from "@mui/material";

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
});

export const UploadFileButton = ({children, onUpload, multiple = false}: {
    children: ReactNode,
    onUpload: (_: FileList) => void,
    multiple?: boolean
}) => {
    return <Button
        component="label"
        role={undefined}
        variant="outlined"
        tabIndex={-1}
        startIcon={<CloudArrowUpIcon/>}
        color={"background-dark2"}
    >
        {children}
        <VisuallyHiddenInput
            type="file"
            onChange={(e) => {
                onUpload(e.target.files)
            }}
            multiple={multiple}
        />
    </Button>
}