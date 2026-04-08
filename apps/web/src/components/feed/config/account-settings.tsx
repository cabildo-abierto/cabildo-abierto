import {useSession} from "@/components/auth/use-session";
import {useCurrentValidationRequest} from "@/queries/getters/useValidation";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {CustomLink as Link} from "@/components/utils/base/custom-link"
import {PermissionLevel} from "../../tema/permission-level";
import {CloseSessionButton} from "@/components/utils/close-session-button";
import React, {ReactNode, useEffect, useState} from "react";
import {DeleteAccountButton} from "./delete-account-button";
import {useAPI} from "@/components/utils/react/queries";
import {StateButton} from "@/components/utils/base/state-button";
import {Account} from "@cabildo-abierto/api";
import {post} from "@/components/utils/react/fetch";
import {Note} from "@/components/utils/base/note";
import {BaseButton} from "@/components/utils/base/base-button";
import {CloseButton} from "@/components/utils/base/close-button";
import {BaseTextField} from "@/components/utils/base/base-text-field";
import {AtIcon, CheckCircleIcon, CopyIcon, FloppyDiskIcon} from "@phosphor-icons/react";
import {AcceptButtonPanel} from "@/components/utils/dialogs/accept-button-panel";
import {BaseFullscreenPopup} from "@/components/utils/dialogs/base-fullscreen-popup";
import {Paragraph} from "@/components/utils/base/paragraph";
import {BaseIconButton} from "@/components/utils/base/base-icon-button";
import {cn} from "@/lib/utils";
import {isValidHandle} from "@atproto/syntax";
import {BackButton} from "@/components/utils/base/back-button";
import SelectionComponent from "@/components/buscar/search-selection-component";
import {configOptionNodes} from "@/components/feed/config/config-option-nodes";
import {toast} from "sonner";


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


type CustomDomainVerifyMethod = "dns" | "http"


const CopyableValue = ({
                           label,
                           value,
                           className
                       }: {
    label?: string
    value: string
    title?: string
    className?: string
}) => {
    const [copied, setCopied] = useState(false)
    return <div
        className={cn(
            "flex flex-col items-start justify-between gap-1 rounded-lg border border-[var(--accent-dark)] bg-[var(--background)] p-2",
            className
        )}
    >
        <div className={"min-w-0 flex-1"}>
            {label ? <div className={"mb-1 text-xs text-[var(--text-light)]"}>{label}</div> : null}
            <div className={"break-all font-mono text-sm text-[var(--foreground)]"}>{value}</div>
        </div>
        <div className={"flex justify-end w-full"}>
            <BaseIconButton
                type={"button"}
                variant={"outlined"}
                size={"small"}
                className={"p-0.5"}
                onClick={() => {
                    void navigator.clipboard.writeText(value).then(() => {
                        setCopied(true)
                        setTimeout(() => {
                            setCopied(false)
                        }, 2000)
                    })
                    toast.success("¡Texto copiado!")
                }}
            >
                <CopyIcon className={copied ? "text-[var(--text-light)]" : ""} size={18} weight={"regular"}/>
            </BaseIconButton>
        </div>
    </div>
}


const AccountHandle = ({
                           currentHandle,
                           userDid,
                           refetchSession,
                       }: {
    currentHandle: string
    userDid: string
    refetchSession: () => Promise<unknown>
}) => {
    const [modalOpen, setModalOpen] = useState(false)
    const [mode, setMode] = useState<"hosted" | "custom">("hosted")
    const [cabildoName, setCabildoName] = useState("")
    const [customHandle, setCustomHandle] = useState("")
    const [customVerifyMethod, setCustomVerifyMethod] = useState<CustomDomainVerifyMethod>("dns")
    const [verifiedDomainDns, setVerifiedDomainDns] = useState<boolean>(false)
    const [verifiedDomainHttp, setVerifiedDomainHttp] = useState<boolean>(false)

    useEffect(() => {
        if (verifiedDomainDns) setVerifiedDomainDns(false)
    }, [customHandle]);

    useEffect(() => {
        if (verifiedDomainHttp) setVerifiedDomainHttp(false)
    }, [customHandle]);

    const dnsTxtValue = `did=${userDid}`

    function openModal() {
        setCustomVerifyMethod("dns")
        setMode("hosted")
        if(currentHandle.endsWith(".cabildo.ar")) {
            setCabildoName(currentHandle.replace(".cabildo.ar", ""))
            setCustomHandle("")
        } else {
            setCabildoName("")
            setCustomHandle(currentHandle)
        }
        setModalOpen(true)
    }

    function closeModal() {
        setModalOpen(false)
    }

    const normalized = mode === "hosted" ? cabildoName + ".cabildo.ar" : customHandle

    const previewHandle = normalized.length > 0 ? normalized : "…"
    const canVerify =
        normalized.length > 0 && isValidHandle(normalized)
    const canSave =
        canVerify && normalized !== currentHandle

    const wellKnownUrl = `https://${normalized}/.well-known/atproto-did`

    async function onSave() {
        const res = await post("/handle", {handle: normalized})
        if (res.success === true) {
            await refetchSession()
            closeModal()
            return {}
        }
        return {error: !res.success ? res.error : "Ocurrió un error."}
    }

    async function onVerifyDomain() {
        const res = await post("/handle/verify-domain", {
            handle: normalized,
            method: customVerifyMethod,
        })
        if (res.success === true) {
            console.log("success!", customVerifyMethod)
            if (customVerifyMethod === "dns") {
                setVerifiedDomainDns(true)
            } else if (customVerifyMethod === "http") {
                setVerifiedDomainHttp(true)
            }
            return {}
        }
        return {error: !res.success ? res.error : "No se pudo verificar."}
    }

    function switchToCustomDomain() {
        setMode("custom")
    }

    function switchBackToHostedSubdomain() {
        setMode("hosted")
    }

    return <>
        <Note className={"text-left"}>
            @{currentHandle}.
            {" "}
            <button
                type={"button"}
                onClick={openModal}
                className={"underline hover:text-[var(--text-light)]"}
            >
                Cambiar
            </button>
        </Note>

        <BaseFullscreenPopup
            open={modalOpen}
            onClose={closeModal}
            closeButton={false}
            backgroundShadow={true}
            fullscreenOnMobile={false}
            ariaLabelledBy={"change-handle-title"}
            className={"z-[1600] max-h-[80vh] overflow-y-auto w-[min(100%,520px)] min-w-[min(100%,320px)] max-w-[calc(100vw-2rem)] border border-[var(--accent-dark)] bg-[var(--background-dark)] group portal"}
        >
            <div className={"flex flex-col gap-5 px-5 pb-6 pt-3 sm:px-6"}>
                <div className={"flex items-center justify-between gap-2 pb-2 border-b border-[var(--accent-dark)]"}>
                    {mode == "custom" && <BackButton
                        size={"default"}
                        onClick={switchBackToHostedSubdomain}
                    />}

                    <h2
                        id={"change-handle-title"}
                        className={"flex-1 text-base font-semibold normal-case tracking-normal text-[var(--foreground)]"}
                    >
                        Cambiar nombre de usuario
                    </h2>
                    <CloseButton onClose={closeModal}/>
                </div>

                <div className={"space-y-2"}>
                    {mode === "hosted" ? (
                        <BaseTextField
                            size={"large"}
                            label={"Nuevo nombre de usuario"}
                            autoFocus
                            startIcon={<AtIcon className={"opacity-80"} size={18} weight={"regular"}/>}
                            endIcon={
                                <span className={"select-none pr-1 text-sm font-medium text-[var(--text-light)]"}>
                                    cabildo.ar
                                </span>
                            }
                            inputGroupClassName={"border-[var(--accent-dark)] bg-[var(--background)]"}
                            value={cabildoName}
                            onChange={(e) => {
                                setCabildoName(e.target.value)
                            }}
                            placeholder={"p. ej. alice"}
                        />
                    ) : (
                        <BaseTextField
                            size={"large"}
                            label={"Dominio a usar como nombre de usuario"}
                            autoFocus
                            startIcon={<AtIcon className={"opacity-80"} size={18} weight={"regular"}/>}
                            inputGroupClassName={"border-[var(--accent-dark)] bg-[var(--background)]"}
                            value={customHandle}
                            onChange={(e) => {
                                setCustomHandle(e.target.value)
                            }}
                            placeholder={"ej. aliciarodriguez.com"}
                        />
                    )}
                    {mode == "hosted" &&
                        <p className={"px-[2px] pt-0.5 text-sm font-light leading-snug text-[var(--text-light)]"}>
                            Tu nombre de usuario completo va a ser{" "}
                            <span className={"font-medium text-[var(--foreground)]"}>@{previewHandle}</span>
                        </p>}
                </div>

                {mode === "custom" ? (
                    <div className={"space-y-3"}>
                        <SelectionComponent
                            onSelection={setCustomVerifyMethod}
                            options={["dns", "http"]}
                            selected={customVerifyMethod}
                            optionsNodes={(o) => {
                                return configOptionNodes(
                                    o == "dns" ? "Con panel de DNS" : "Sin panel de DNS",
                                    o == customVerifyMethod,
                                    "py-1.5 w-full"
                                )
                            }}
                            className={"flex space-x-2"}
                        />

                        {customVerifyMethod === "dns" ? (
                                <div className={"space-y-3"}>
                                    <Paragraph
                                        className={"text-sm font-light leading-relaxed text-[var(--text-light)]"}>
                                        Añadí el siguiente registro DNS a tu dominio.
                                    </Paragraph>
                                    <div className={"flex space-x-1"}>
                                        <CopyableValue label={"Alojamiento (nombre / host)"} value={"_atproto"}/>
                                        <CopyableValue label={"Tipo"} value={"TXT"} className={"min-w-16"}/>
                                        <CopyableValue label={"Valor"} value={dnsTxtValue}/>
                                    </div>
                                </div>
                            ) : (
                                <div className={"space-y-3"}>
                                    <Paragraph className={"text-sm text-[var(--text-light)] font-light"}>
                                        Publicá un archivo de texto en la ruta <span
                                        className={"break-all text-[var(--text)]"}>
                                            {wellKnownUrl}
                                        </span> con el siguiente contenido:
                                    </Paragraph>
                                    <CopyableValue value={userDid}/>
                                </div>
                            )}
                    </div>
                ) : null}

                {mode === "hosted" ? (
                    <div className={"space-y-2"}>
                        <StateButton
                            className={"w-full justify-center rounded-lg normal-case tracking-normal"}
                            textClassName={"normal-case"}
                            handleClick={onSave}
                            disabled={!canSave}
                            variant={"outlined"}
                            size={"default"}
                        >
                            Guardar
                        </StateButton>
                        <BaseButton
                            type={"button"}
                            variant={"outlined"}
                            size={"default"}
                            className={"w-full justify-center rounded-lg normal-case tracking-normal text-[var(--foreground)]"}
                            onClick={switchToCustomDomain}
                        >
                            Usar mi propio dominio
                        </BaseButton>
                    </div>
                ) : (
                    <div className={"space-y-3"}>
                        {mode === "custom" && (customVerifyMethod == "dns" && verifiedDomainDns || customVerifyMethod == "http" && verifiedDomainHttp) && <div
                            className={"justify-center flex space-x-1 items-center text-[var(--text-light)]"}
                        >
                            <div>
                                ¡Verificación exitosa!
                            </div>
                            <CheckCircleIcon weight={"fill"}/>
                        </div>}
                        <div className={"flex flex-wrap gap-1.5"}>
                            <StateButton
                                className={"w-full justify-center rounded-lg normal-case tracking-normal"}
                                textClassName={"normal-case"}
                                handleClick={onVerifyDomain}
                                disabled={!canVerify}
                                variant={"outlined"}
                                size={"default"}
                            >
                                {customVerifyMethod === "dns"
                                    ? "Verificar registro DNS"
                                    : "Verificar archivo de texto"}
                            </StateButton>
                            <StateButton
                                className={"w-full justify-center rounded-lg normal-case tracking-normal"}
                                textClassName={"normal-case"}
                                handleClick={onSave}
                                disabled={!canSave}
                                variant={"outlined"}
                                size={"default"}
                            >
                                Guardar nombre de usuario
                            </StateButton>
                        </div>
                    </div>
                )}
            </div>
        </BaseFullscreenPopup>
    </>
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
        const res = await post(`/unsubscribe`)
        if (res.success === false) {
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


const VERIFICATION_COOLDOWN_SECONDS = 30

const AccountEmail = () => {
    const {account, refetch} = useAccount()
    const [addingEmail, setAddingEmail] = useState(false)
    const [newEmail, setNewEmail] = useState("")
    const [lastSendAt, setLastSendAt] = useState<number | null>(null)
    const [cooldownRemaining, setCooldownRemaining] = useState(0)
    const [showEmailSentPopup, setShowEmailSentPopup] = useState(false)
    const [sent, setSent] = useState(false)

    React.useEffect(() => {
        if (lastSendAt === null) return
        const updateCooldown = () => {
            const elapsed = (Date.now() - lastSendAt) / 1000
            const remaining = Math.ceil(VERIFICATION_COOLDOWN_SECONDS - elapsed)
            if (remaining <= 0) {
                setCooldownRemaining(0)
                setLastSendAt(null)
                return
            }
            setCooldownRemaining(remaining)
        }
        updateCooldown()
        const interval = setInterval(updateCooldown, 1000)
        return () => clearInterval(interval)
    }, [lastSendAt])

    async function onSaveNewEmail() {
        const res = await post("/email", {email: newEmail})
        if (res.success === true) {
            await refetch()
            setAddingEmail(false)
            return {}
        } else {
            return {error: res.error}
        }
    }

    async function onSendVerification() {
        const res = await post("/send-verification-email")
        if (res.success === true) {
            setLastSendAt(Date.now())
            setShowEmailSentPopup(true)
            setSent(true)
            return {}
        } else {
            if (res.error?.includes("30 segundos")) {
                setLastSendAt(Date.now())
            }
            return {error: res.error}
        }
    }

    const canSendVerification = cooldownRemaining === 0

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
        return <div className={"space-y-1"}>
            <Note className={"text-left"}>
                {account.email}.
                {" "}
                <button onClick={() => setAddingEmail(true)}
                        className={"underline hover:text-[var(--text-light)]"}>
                    Cambiar
                </button>
                .
                {" "}
            </Note>
            {account.emailVerified
                ? <Note
                    className={"text-left flex items-center space-x-1"}><span>Correo verificado.</span><CheckCircleIcon/></Note>
                : <> <StateButton
                    handleClick={onSendVerification}
                    size={"small"}
                    variant={"outlined"}
                    disabled={!canSendVerification}
                    className={"py-1 text-xs"}
                    textClassName={"normal-case"}
                >
                    {canSendVerification ? (!sent ? "Verificar correo" : "Volver a enviar") : `Podés enviar otro en ${cooldownRemaining} s`}
                </StateButton></>
            }
            {showEmailSentPopup && (
                <AcceptButtonPanel
                    open={showEmailSentPopup}
                    onClose={async () => {
                        setShowEmailSentPopup(false)
                        return {}
                    }}
                    className={"max-w-[400px]"}
                >
                    <div className="space-y-2">
                        <h2 className="font-semibold text-lg">Enviamos un correo de verificación</h2>
                        <Paragraph>
                            Revisá tu bandeja de entrada (y la carpeta de spam) y hacé clic en el enlace para verificar
                            tu correo.
                        </Paragraph>
                    </div>
                </AcceptButtonPanel>
            )}
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
    const {user, refetch: refetchSession} = useSession()
    const {account, isLoading, refetch: refetchAccount} = useAccount()
    const {data: request, isLoading: requestLoading} = useCurrentValidationRequest()

    if (isLoading || requestLoading) {
        return <div className={"py-8"}>
            <LoadingSpinner/>
        </div>
    }

    async function onSubscribe() {
        const res = await post("/subscribe")
        if (res.success === false) {
            return {error: "Ocurrió un error al suscribirte a la lista de correo."}
        }
        await refetchAccount()
        return {}
    }

    return <div className={"py-4 space-y-4"}>
        <SettingsElement label={"Nombre de usuario"}>
            <AccountHandle
                currentHandle={user.handle}
                userDid={user.did}
                refetchSession={refetchSession}
            />
        </SettingsElement>
        <SettingsElement label={"Nombre visible"}>
            <Note className={"text-left"}>
                {user.displayName ? user.displayName : "Sin definir."}
            </Note>
        </SettingsElement>
        <SettingsElement label={"Contraseña"}>
            {account.endpoint.endsWith("bsky.network") && <ChangeFromBluesky/>}
            {account.endpoint == "https://cabildo.ar" && <Note className={"text-left"}>
                <Link href={"/recuperacion/clave"}>Cambiar contraseña</Link>.
            </Note>}
            {account.endpoint != "https://cabildo.ar" && !account.endpoint.endsWith("bsky.network") &&
                <Note className={"text-left"}>
                    Podés cambiar tu contraseña desde tu proveedor de alojamiento.
                </Note>}
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
        <SettingsElement label={"Alojamiento"}>
            {account.endpoint && <Note className={"text-left"}>
                Tu cuenta está alojada en <Link href={account.endpoint} className={"text-[var(--text-light)]"}>
                {account.endpoint}</Link>.
            </Note>}
            {!account.endpoint && <Note className={"text-left"}>
                Ocurrió un error al obtener el servidor de tu cuenta.
            </Note>}
        </SettingsElement>

        <div className={"pt-4 flex justify-start"}>
            <CloseSessionButton/>
        </div>
        <div className={"mt-4 flex justify-start"}>
            <DeleteAccountButton/>
        </div>
    </div>
}