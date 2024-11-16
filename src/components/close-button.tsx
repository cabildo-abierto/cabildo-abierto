import { IconButton } from "@mui/material"
import { CloseButtonIcon } from "./icons"



export const CloseButton = ({onClose, size}: {onClose: () => void, size?: "small" | "medium" | "large"}) => {
    return <IconButton onClick={onClose} color="inherit" size={size}>
        <CloseButtonIcon fontSize="inherit"/>
    </IconButton>
}