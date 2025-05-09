import {IconButton} from "./icon-button"
import {CloseButtonIcon} from "@/components/icons/close-button-icon"
import {stopPropagation} from "@/utils/utils";
import {Color} from "./button";


export const CloseButton = ({onClose, size, color="background-dark"}: {
    onClose: () => void, size?: "small" | "medium" | "large", color?: Color }) => {
    return <IconButton
        onClick={stopPropagation(onClose)}
        color={color}
        size={size}
    >
        <CloseButtonIcon fontSize="inherit"/>
    </IconButton>
}