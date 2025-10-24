import {Button} from "@/components/layout/utils/button";
import StateButton, {StateButtonClickHandler} from "@/components/layout/utils/state-button";
import {BaseFullscreenPopup} from "@/components/layout/utils/base-fullscreen-popup";


export const ConfirmModal = ({
    open,
    title,
    text,
    onConfirm,
    onClose,
    confirmButtonText="Confirmar"
}: {
    title: string,
    text: string,
    open: boolean
    onConfirm: StateButtonClickHandler
    onClose: () => void
    confirmButtonText?: string
}) => {
    return <BaseFullscreenPopup
        open={open}
        closeButton={true}
        onClose={() => {onClose()}}
    >
        <div className={"px-8 pb-4 space-y-4"}>
            <h3 className={"normal-case"}>
                {title}
            </h3>
            <div className={"font-light text-[var(--text-light)] max-w-[300px]"}>
                {text}
            </div>
            <div className={"flex justify-end space-x-2 mr-2"}>
                <Button
                    size={"small"}
                    onClick={onClose}
                >
                    <span>
                        Cancelar
                    </span>
                </Button>
                <StateButton
                    handleClick={async (e) => {
                        const res = await onConfirm(e)
                        if(!res.error) {
                            onClose()
                        }
                        return res
                    }}
                    size={"small"}
                    color={"red-dark"}
                    text1={confirmButtonText}
                    textClassName={"text-[var(--white-text)]"}
                />
            </div>
        </div>
    </BaseFullscreenPopup>
}