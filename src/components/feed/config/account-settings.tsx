import {useSession} from "@/queries/getters/useSession";
import {useCurrentValidationRequest} from "@/queries/getters/useValidation";
import LoadingSpinner from "../../layout/base/loading-spinner";
import {CustomLink as Link} from "../../layout/utils/custom-link";
import {PermissionLevel} from "@/components/topics/topic/permission-level";
import {CloseSessionButton} from "@/components/auth/close-session-button";
import React, {ReactNode} from "react";
import {DeleteAccountButton} from "@/components/feed/config/delete-account-button";
import {useAPI} from "@/queries/utils";
import {Account} from "@/lib/types";


const useAccount = () => {
    const res = useAPI<Account>("/account", ["account"])
    return {...res, account: res.data}
}


const SettingsElement = ({label, children}: {
    children: ReactNode,
    label: string
}) => {
    return <div className="space-y-[2px]">
        <div className="text-[var(--text-light)] text-sm">{label}</div>
        <div className="text-base">{children}</div>
    </div>
}


const ChangeFromBluesky = ({add = false}: { add?: boolean }) => {
    return <Link
        className="text-sm text-[var(--text)] hover:text-[var(--text-light)] underline"
        target="_blank"
        href={"https://bsky.app/settings/account"}
    >
        {add ? "Agregar" : "Cambiar"} desde Bluesky
    </Link>
}


export const AccountSettings = () => {
    const {user} = useSession()
    const {account, isLoading} = useAccount()
    const {data: request, isLoading: requestLoading} = useCurrentValidationRequest()

    if (isLoading || requestLoading) {
        return <div className={"py-8"}>
            <LoadingSpinner/>
        </div>
    }

    return <div className={"py-4 space-y-4"}>
        <SettingsElement label={"Nombre de usuario"}>
            @{user.handle}
        </SettingsElement>
        <SettingsElement label={"Nombre visible"}>
            {user.displayName ? user.displayName : "Sin definir."}
        </SettingsElement>
        <SettingsElement label={"Contraseña"}>
            <ChangeFromBluesky/>
        </SettingsElement>
        <SettingsElement label={"Correo"}>
            {account.email ? <div className="text-lg ">{account.email}</div> :
                <div className="text-lg ">Pendiente</div>}
            <ChangeFromBluesky add={account.email == null}/>
        </SettingsElement>
        <SettingsElement label={"Permisos de edición"}>
            <PermissionLevel level={user.editorStatus}/>
        </SettingsElement>
        <SettingsElement label={"Verificación de la cuenta"}>
            {!request || request.result != "Aceptada" ? "Sin verificar." : (request.type == "persona" ? "Cuenta de persona verificada." : "Cuenta de organización verificada.")} {(!request.result || request.result != "Aceptada") && <Link
                className="underline hover:text-[var(--text-light)]"
                href={"/ajustes/verificacion/verificar"}
            >
                Verificar cuenta
            </Link>}
        </SettingsElement>

        <div className={"mt-4 flex justify-start"}>
            <CloseSessionButton/>
        </div>
        <div className={"mt-4 flex justify-start"}>
            <DeleteAccountButton/>
        </div>
    </div>
}