import {BaseIconButton} from "../base/base-icon-button"
import {CloseButtonIcon} from "@/components/layout/icons/close-button-icon"
import {stopPropagation} from "@/utils/utils";
import {ButtonProps} from "@/components/ui/button";


export const CloseButton = ({
                                onClose,
                                className,
                                size = "default",
                                variant = "default",
                                disabled = false
                            }: {
    onClose: () => void
    size?: "small" | "default" | "large"
    className?: string
    variant?: ButtonProps["variant"]
    disabled?: boolean
}) => {
    return <BaseIconButton
        variant={variant}
        onClick={stopPropagation(onClose)}
        size={size}
        className={className}
        disabled={disabled}
    >
        <CloseButtonIcon/>
    </BaseIconButton>
}