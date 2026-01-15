import {WriteButtonIcon} from "@/components/utils/icons/write-button-icon";
import {BaseButton, BaseButtonProps} from "@/components/utils/base/base-button";


export const ReplyButton = ({
                                onClick,
                                text = "Responder",
                                variant = "text",
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