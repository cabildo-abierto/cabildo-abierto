import { IconButton } from "@mui/material"
import { CloseButtonIcon } from "@/components/icons/close-button-icon"
import {stopPropagation} from "@/utils/utils";



export const CloseButton = ({onClose, size}: {onClose: () => void, size?: "small" | "medium" | "large"}) => {
    return <IconButton onClick={stopPropagation(onClose)} color="inherit" size={size}>
        <CloseButtonIcon fontSize="inherit"/>
    </IconButton>
}