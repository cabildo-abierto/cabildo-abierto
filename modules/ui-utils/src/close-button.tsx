import {IconButton} from "./icon-button"
import {CloseButtonIcon} from "@/components/layout/icons/close-button-icon"
import {stopPropagation} from "@/utils/utils";

import {Color} from "./color";


export const CloseButton = ({onClose, size, color="transparent", hoverColor}: {
    onClose: () => void, size?: "small" | "medium" | "large", color?: Color, hoverColor?: Color }) => {
    return <IconButton
        onClick={stopPropagation(onClose)}
        color={color}
        hoverColor={hoverColor}
        size={size}
        sx={{borderRadius: 0}}
    >
        <CloseButtonIcon fontSize="inherit"/>
    </IconButton>
}