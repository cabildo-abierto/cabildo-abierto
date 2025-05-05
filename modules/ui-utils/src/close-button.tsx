import {IconButton} from "@mui/material"
import {CloseButtonIcon} from "@/components/icons/close-button-icon"
import {stopPropagation} from "@/utils/utils";


export const CloseButton = ({onClose, size, backgroundColor, hoverColor}: {
    onClose: () => void, size?: "small" | "medium" | "large", backgroundColor?: string, hoverColor?: string }) => {
    return <IconButton
        onClick={stopPropagation(onClose)}
        color="inherit"
        sx={{backgroundColor: backgroundColor, ":hover": {backgroundColor: hoverColor}}}
        size={size}
    >
        <CloseButtonIcon fontSize="inherit"/>
    </IconButton>
}