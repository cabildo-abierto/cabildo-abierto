import {BaseButton, BaseButtonProps} from "../layout/base/baseButton";
import {WriteButtonIcon} from "@/components/layout/icons/write-button-icon";


export const ReplyButton = ({
                                onClick,
                                text = "Responder",
                                variant = "default",
                                size
                            }: {
    onClick: () => void
    text?: string
    variant?: BaseButtonProps["variant"]
    size?: BaseButtonProps["size"]
}) => {
    return <BaseButton
        onClick={onClick}
        variant={variant}
        className={"flex w-full text-xs border-[var(--accent-dark)] border-t border-b justify-start px-[22px]"}
        size={size}
        startIcon={<WriteButtonIcon/>}
    >
        {text}
    </BaseButton>
}