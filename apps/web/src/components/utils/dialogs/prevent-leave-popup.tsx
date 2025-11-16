import { WarningCircleIcon } from "@phosphor-icons/react"
import { BaseFullscreenPopup } from "./base-fullscreen-popup"
import {BaseButton} from "@/components/utils/base/base-button"



export const PreventLeavePopup = ({navGuard}: {
    navGuard: {
        active: boolean,
        accept: () => void,
        reject: () => void
    }
}) => {
    return <BaseFullscreenPopup open={navGuard.active}>
        <div className={"flex flex-col p-8 space-y-8 text-[var(--text-light)]"}>
            <div className={"flex items-center space-x-1"}>
                <WarningCircleIcon fontSize={"18"}/>
                <div className={"font-light"}>
                    Tenés cambios sin guardar.
                </div>
            </div>
            <div className={"flex justify-center space-x-2"}>
                <BaseButton variant={"outlined"} size={"small"} onClick={navGuard.reject}>
                    Volver a editar
                </BaseButton>
                <BaseButton variant={"error"} size={"small"} onClick={navGuard.accept}>
                    Salir igualmente
                </BaseButton>
            </div>
        </div>
    </BaseFullscreenPopup>
}