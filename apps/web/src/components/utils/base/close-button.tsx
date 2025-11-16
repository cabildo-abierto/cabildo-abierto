import {BaseIconButton} from "@/components/utils/base/base-icon-button"
import {CloseButtonIcon} from "@/components/utils/icons/close-button-icon"
import {ButtonProps} from "@/components/utils/ui/button";


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
        onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onClose()
        }}
        size={size}
        className={className}
        disabled={disabled}
    >
        <CloseButtonIcon/>
    </BaseIconButton>
}