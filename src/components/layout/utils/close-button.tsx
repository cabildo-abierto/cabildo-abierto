import {IconButton} from "./icon-button"
import {CloseButtonIcon} from "@/components/layout/icons/close-button-icon"
import {stopPropagation} from "@/utils/utils";

import {Color} from "./color";


export const CloseButton = ({
                                onClose,
                                iconColor,
                                size,
                                color="transparent",
                                hoverColor}: {
    onClose: () => void
    size?: "small" | "medium" | "large"
    iconColor?: Color
    color?: Color
    hoverColor?: Color
}) => {
    return <IconButton
        onClick={stopPropagation(onClose)}
        color={color}
        hoverColor={hoverColor}
        size={size}
        sx={{borderRadius: 0, color: `var(--${iconColor})`}}
    >
        <CloseButtonIcon color="inherit" fontSize="inherit"/>
    </IconButton>
}