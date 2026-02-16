import {BaseFullscreenPopup} from "@/components/utils/dialogs/base-fullscreen-popup";
import {BaseButton} from "@/components/utils/base/base-button";
import {StateButton} from "@/components/utils/base/state-button";


export const ConfirmEditPopup = ({
    setForceEditModalOpen,
    handleClickSubmit
                                 }: {
    setForceEditModalOpen: (open: boolean) => void
    handleClickSubmit: (force: boolean) => Promise<{ error?: string }>
}) => {
    return <BaseFullscreenPopup open={true}>
        <div className={"pb-4 pt-8 space-y-8"}>
            <div className={"font-light text-[var(--text-light)] text-sm max-w-[400px] px-8"}>
                La publicación ya fue referenciada. Si la editás ahora el cambio se va a ver reflejado
                en Cabildo
                Abierto pero no en Bluesky.
            </div>
            <div className={"flex space-x-2 justify-center"}>
                <BaseButton
                    variant={"outlined"}
                    size={"small"}
                    onClick={() => {
                        setForceEditModalOpen(false)
                    }}
                >
                    Cancelar
                </BaseButton>
                <StateButton
                    variant={"outlined"}
                    size={"small"}
                    handleClick={async () => {
                        const {error} = await handleClickSubmit(true)
                        if (!error) {
                            setForceEditModalOpen(false)
                        }
                        return {error}
                    }}
                >
                    Editar igualmente
                </StateButton>
            </div>
        </div>
    </BaseFullscreenPopup>
}