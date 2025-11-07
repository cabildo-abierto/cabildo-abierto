import {BaseButton, BaseButtonProps} from "@/components/layout/base/baseButton";
import StateButton, {StateButtonClickHandler} from "@/components/layout/utils/state-button";
import {BaseFullscreenPopup} from "@/components/layout/base/base-fullscreen-popup";


export const ConfirmModal = ({
    open,
    title,
    text,
    onConfirm,
    onClose,
    confirmButtonText="Confirmar",
    confirmButtonClassName,
    confirmButtonVariant="outlined"
}: {
    title: string,
    text: string,
    open: boolean
    onConfirm: StateButtonClickHandler
    onClose: () => void
    confirmButtonText?: string
    confirmButtonClassName?: string
    confirmButtonVariant?: BaseButtonProps["variant"]
}) => {
    return <BaseFullscreenPopup
        open={open}
        closeButton={true}
        onClose={() => {onClose()}}
        className={"z-[1600] sm:w-auto"}
    >
        <div className={"px-8 pb-4 space-y-4"}>
            <h3 className={"normal-case"}>
                {title}
            </h3>
            <div className={"font-light text-[var(--text-light)] max-w-[300px]"}>
                {text}
            </div>
            <div className={"flex justify-end space-x-2 mr-2"}>
                <BaseButton
                    size={"small"}
                    onClick={onClose}
                    variant={"outlined"}
                >
                    Cancelar
                </BaseButton>
                <StateButton
                    handleClick={async (e) => {
                        const res = await onConfirm(e)
                        if(res && !res.error) {
                            onClose()
                        }
                        if(res) {
                            return res
                        }
                    }}
                    size={"small"}
                    className={confirmButtonClassName}
                    variant={confirmButtonVariant}
                >
                    {confirmButtonText}
                </StateButton>
            </div>
        </div>
    </BaseFullscreenPopup>
}