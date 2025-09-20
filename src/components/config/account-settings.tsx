import {useSession} from "@/queries/useSession";
import {useCurrentValidationRequest} from "@/queries/useValidation";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {CustomLink as Link} from "../../../modules/ui-utils/src/custom-link";
import {PermissionLevel} from "@/components/topics/topic/permission-level";
import {Button} from "../../../modules/ui-utils/src/button";
import {CloseSessionButton} from "@/components/layout/auth/close-session-button";
import React from "react";
import {DeleteAccountButton} from "@/components/config/delete-account-button";
import {useAPI} from "@/queries/utils";
import {Account} from "@/lib/types";


const useAccount = () => {
    const res = useAPI<Account>("/account", ["account"])
    return {...res, account: res.data}
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

    return <>
        <div className="mb-4">
            <div className="text-[var(--text-light)] font-medium text-sm">Nombre de usuario</div>
            <div className="text-lg ">@{user.handle}</div>
        </div>
        <div className="mb-4">
            <div className="text-[var(--text-light)] font-medium text-sm">Nombre visible</div>
            <div className="text-lg ">{user.displayName ? user.displayName : "Sin definir."}</div>
        </div>
        <div className="mb-4">
            <div className="text-[var(--text-light)] font-medium text-sm">Contraseña</div>
            <Link
                className="text-[var(--primary)] hover:underline"
                target="_blank"
                href={"https://bsky.app/settings/account"}
            >
                Cambiar desde Bluesky.
            </Link>
        </div>
        <div className="mb-4">
            <div className="text-[var(--text-light)] font-medium text-sm">Mail</div>
            {account.email ? <div className="text-lg ">{account.email}</div> :
                <div className="text-lg ">Pendiente</div>}
            <Link
                className="text-[var(--primary)] hover:underline"
                target="_blank"
                href={"https://bsky.app/settings/account"}
            >
                {account.email ? "Cambiar" : "Agregar"} desde Bluesky.
            </Link>
        </div>
        <div className="mb-4">
            <div className="text-[var(--text-light)] font-medium text-sm">Permisos de edición en la wiki</div>
            <div className="text-lg">
                <PermissionLevel level={user.editorStatus} className={""}/>
            </div>
        </div>
        <div className="mb-4">
            <div className="text-[var(--text-light)] font-medium text-sm">Verificación de la cuenta</div>
            <div className="text-lg">
                {!request || request.result != "Aceptada" ? "Sin verificar." : (request.type == "persona" ? "Cuenta de persona verificada." : "Cuenta de organización verificada.")}
            </div>
        </div>
        {(!request.result || request.result != "Aceptada") &&
            <Button size={"small"} href={"/ajustes/solicitar-validacion"}>
                <span className={"font-semibold text-sm py-1"}>Verificar cuenta</span>
            </Button>}
        <div className={"mt-4 flex justify-start"}>
            <CloseSessionButton/>
        </div>
        <div className={"mt-4 flex justify-start"}>
            <DeleteAccountButton/>
        </div>
    </>
}