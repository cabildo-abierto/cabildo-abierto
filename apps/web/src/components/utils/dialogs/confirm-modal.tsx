import {BaseButton, BaseButtonProps} from "../base/base-button";
import {BaseFullscreenPopup} from "./base-fullscreen-popup"
import {StateButton, StateButtonClickHandler} from "../base/state-button";


export const ConfirmModal = ({
                                 open,
                                 title,
                                 text,
                                 onConfirm,
                                 onClose,
                                 confirmButtonText = "Confirmar",
                                 confirmButtonClassName,
                                 confirmButtonVariant = "outlined"
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
        onClose={() => {
            onClose()
        }}
        fullscreenOnMobile={false}
        className={"z-[1600] min-[340px]:min-w-[340px]"}
    >
        <div className={"px-8 pb-4 space-y-4"}>
            <div className={"space-y-2"}>
                <h3 className={"normal-case"}>
                    {title}
                </h3>
                <div className={"font-light text-[var(--text-light)] max-w-[300px]"}>
                    {text}
                </div>
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
                        if (res && !res.error) {
                            onClose()
                        }
                        if (res) {
                            return res
                        }
                        return {}
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