import {BaseFullscreenPopup} from "../../utils/dialogs/base-fullscreen-popup";
import {StateButton} from "@/components/utils/base/state-button"
import {useState} from "react";
import { BaseTextField } from "@/components/utils/base/base-text-field";
import {useLogout} from "@/components/auth/logout";
import {post} from "@/components/utils/react/fetch";


const DeleteAccountModal = ({
                                open,
                                onClose
                            }: {
    open: boolean
    onClose: () => void
}) => {
    const [text, setText] = useState("")
    const {logout} = useLogout()

    async function onClick() {
        const {error} = await post<{}, {}>("/delete-ca-profile", {})
        if (error) return {error}
        return await logout()
    }

    return <BaseFullscreenPopup
        open={open}
        onClose={onClose}
        closeButton={true}
    >
        <div className={"pb-4 flex flex-col items-center w-[400px] text-[var(--text-light)] px-8 space-y-4"}>
            <h3>
                Borrar cuenta
            </h3>
            <div className={"text-sm space-y-2"}>
                <p>
                    Tu cuenta va a dejar de ser parte de Cabildo Abierto pero no se va a borrar ningún contenido de tu
                    repositorio personal de datos.
                </p>
                <p>
                    Esta decisión es reversible. Si querés borrar definitivamente todos tus datos escribinos a
                    soporte@cabildoabierto.ar.
                </p>
                <p>
                    {'Escribí "borrarcuenta" para confirmar.'}
                </p>
            </div>
            <div className={"w-full"}>
                <BaseTextField
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value)
                    }}
                />
            </div>
            <div className={"flex justify-end w-full"}>
                <StateButton
                    variant={"error"}
                    handleClick={onClick}
                    disabled={text != "borrarcuenta"}
                    textClassName={text == "borrarcuenta" ? "" : ""}
                >
                    Confirmar
                </StateButton>
            </div>
        </div>
    </BaseFullscreenPopup>
}


export default DeleteAccountModal