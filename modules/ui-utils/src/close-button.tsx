import {IconButton} from "./icon-button"
import {CloseButtonIcon} from "@/components/icons/close-button-icon"
import {stopPropagation} from "@/utils/utils";

import {Color} from "./color";


export const CloseButton = ({onClose, size, color="transparent"}: {
    onClose: () => void, size?: "small" | "medium" | "large", color?: Color }) => {
    return <IconButton
        onClick={stopPropagation(onClose)}
        color={color}
        size={size}
    >
        <CloseButtonIcon fontSize="inherit"/>
    </IconButton>
}