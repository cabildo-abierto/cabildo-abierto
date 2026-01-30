import {useSession} from "@/components/auth/use-session";
import {useCurrentValidationRequest} from "@/queries/getters/useValidation";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {CustomLink as Link} from "@/components/utils/base/custom-link"
import {PermissionLevel} from "../../tema/permission-level";
import {CloseSessionButton} from "@/components/utils/close-session-button";
import React, {ReactNode, useState} from "react";
import {DeleteAccountButton} from "./delete-account-button";
import {useAPI} from "@/components/utils/react/queries";
import {StateButton} from "@/components/utils/base/state-button";
import {Account} from "@cabildo-abierto/api";
import {post} from "@/components/utils/react/fetch";
import {Note} from "@/components/utils/base/note";
import {BaseButton} from "@/components/utils/base/base-button";
import {CloseButton} from "@/components/utils/base/close-button";
import {BaseTextField} from "@/components/utils/base/base-text-field";
import {FloppyDiskIcon} from "@phosphor-icons/react";


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
        {children}
    </div>
}


const ChangeFromBluesky = ({add = false}: { add?: boolean }) => {
    return <Note className={"text-left"}>
        <Link
            target="_blank"
            href={"https://bsky.app/settings/account"}
        >
            {add ? "Agregar" : "Cambiar"} desde Bluesky
        </Link>.
    </Note>
}


const UnsubscribeButton = () => {
    const {refetch: refetchAccount} = useAccount()

    async function onUnsubscribe() {
        const {error} = await post(`/unsubscribe`)
        if (error) {
            return {error: "Ocurrió un error al desuscribirte de la lista de correo."}
        }
        await refetchAccount()
        return {}
    }

    return <Note className={"text-left"}>
        Suscripción activa. <StateButton
        handleClick={onUnsubscribe}
        className={"underline hover:text-[var(--text-light)] px-0 hover:bg-transparent font-normal"}
        textClassName={"normal-case font-light"}
    >
        Desuscribirme
    </StateButton>.
    </Note>
}

const EMAIL_REGEX =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string) {
    return EMAIL_REGEX.test(email);
}


const AccountEmail = () => {
    const {account, refetch} = useAccount()
    const [addingEmail, setAddingEmail] = useState(false)
    const [newEmail, setNewEmail] = useState("")

    async function onSaveNewEmail() {
        const {error} = await post("/email", {email: newEmail})
        if (!error) {
            await refetch()
            setAddingEmail(false)
        }
        return {error}
    }

    if (addingEmail) {
        return <div className={"flex space-x-2"}>
            <BaseTextField
                className={"max-w-64"}
                size={"small"}
                value={newEmail}
                type={"email"}
                onChange={(e) => {
                    setNewEmail(e.target.value)
                }}
                placeholder={"Correo electrónico..."}
            />
            <StateButton
                startIcon={<FloppyDiskIcon/>}
                handleClick={onSaveNewEmail}
                disabled={!isValidEmail(newEmail)}
            />
            <CloseButton
                size={"small"}
                onClose={() => {
                    setAddingEmail(false)
                }}
            />
        </div>
    } else if (account.email) {
        return <div>
            <Note className={"text-left"}>
                {account.email}. <button onClick={() => setAddingEmail(true)}
                                         className={"underline hover:text-[var(--text-light)]"}>Cambiar</button>.
            </Note>
        </div>
    } else {
        return <div>
            {!addingEmail && <BaseButton
                onClick={() => {
                    setAddingEmail(true)
                }}
                size={"small"}
                variant={"outlined"}
            >
                Agregar
            </BaseButton>}
        </div>
    }
}


export const AccountSettings = () => {
    const {user} = useSession()
    const {account, isLoading, refetch: refetchAccount} = useAccount()
    const {data: request, isLoading: requestLoading} = useCurrentValidationRequest()

    if (isLoading || requestLoading) {
        return <div className={"py-8"}>
            <LoadingSpinner/>
        </div>
    }

    async function onSubscribe() {
        const {error} = await post("/subscribe")
        if (error) {
            return {error: "Ocurrió un error al suscribirte a la lista de correo."}
        }
        await refetchAccount()
        return {}
    }

    return <div className={"py-4 space-y-4"}>
        <SettingsElement label={"Nombre de usuario"}>
            <Note className={"text-left"}>
                @{user.handle}
            </Note>
        </SettingsElement>
        <SettingsElement label={"Nombre visible"}>
            <Note className={"text-left"}>
                {user.displayName ? user.displayName : "Sin definir."}
            </Note>
        </SettingsElement>
        <SettingsElement label={"Contraseña"}>
            <ChangeFromBluesky/>
        </SettingsElement>
        {account && <SettingsElement label={"Correo"}>
            <AccountEmail/>
        </SettingsElement>}
        {account && <SettingsElement label={"Novedades por correo"}>
            {account.email && (account.subscribedToEmailUpdates ? <UnsubscribeButton/> :
                <StateButton handleClick={onSubscribe} size={"small"} variant={"outlined"}>
                    Suscribirme
                </StateButton>)}
            {!account.email && <Note className={"text-left"}>Agregá un correo electrónico primero.</Note>}
        </SettingsElement>}
        <SettingsElement label={"Permisos de edición"}>
            <Note className={"text-left"}>
                <PermissionLevel level={user.editorStatus}/>
            </Note>
        </SettingsElement>
        <SettingsElement label={"Verificación de la cuenta"}>
            <Note className={"text-left"}>
            {!request || request.result != "Aceptada" ? "Sin verificar." : (request.type == "persona" ? "Cuenta de persona verificada." : "Cuenta de organización verificada.")} {(!request.result || request.result != "Aceptada") &&
            <Link
                className="underline hover:text-[var(--text-light)]"
                href={"/ajustes/verificacion/verificar"}
            >
                Verificar cuenta
            </Link>}
            </Note>
        </SettingsElement>

        <div className={"mt-4 flex justify-start"}>
            <CloseSessionButton/>
        </div>
        <div className={"mt-4 flex justify-start"}>
            <DeleteAccountButton/>
        </div>
    </div>
}