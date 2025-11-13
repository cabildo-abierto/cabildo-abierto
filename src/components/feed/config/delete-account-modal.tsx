import {BaseFullscreenPopup} from "../../layout/base/base-fullscreen-popup";
import StateButton from "../../layout/utils/state-button";
import {useState} from "react";
import {post} from "@/utils/fetch";
import {logout} from "@/components/auth/close-session-button";
import {useQueryClient} from "@tanstack/react-query";
import {useRouter} from "next/navigation";
import { BaseTextField } from "../../layout/base/base-text-field";


const DeleteAccountModal = ({
                                open,
                                onClose
                            }: {
    open: boolean
    onClose: () => void
}) => {
    const [text, setText] = useState("")
    const qc = useQueryClient()
    const router = useRouter()

    async function onClick() {
        const {error} = await post<{}, {}>("/delete-ca-profile", {})
        if (error) return {error}
        return await logout(qc, router)
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
                    textClassName={text == "borrarcuenta" ? "text-[var(--background)]" : ""}
                >
                    Confirmar
                </StateButton>
            </div>
        </div>
    </BaseFullscreenPopup>
}


export default DeleteAccountModal