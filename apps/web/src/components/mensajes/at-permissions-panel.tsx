import React, {useEffect, useRef, useState} from "react"
import {useQueryClient} from "@tanstack/react-query"
import {BaseButton} from "@/components/utils/base/base-button"
import {Switch} from "@/components/utils/ui/switch"
import {post} from "@/components/utils/react/fetch"
import {useErrors} from "@/components/layout/contexts/error-context"
import {useSession} from "@/components/auth/use-session"
import {useAPI} from "@/components/utils/react/queries"
import {cn} from "@/lib/utils"
import {LoadingSpinner} from "@/components/utils/base/loading-spinner"
import {Paragraph} from "@/components/utils/base/paragraph"

export const AT_SCOPE_CONFIG_QUERY_KEY = ["config", "at_scope"] as const

const FIXED_SCOPES = ["atproto"]
const SCOPE_CHAT = "transition:chat.bsky"
const SCOPE_HANDLE = "identity:handle"
const SCOPE_GENERIC = "transition:generic"
const SCOPE_EMAIL = "transition:email"

function buildAtScope(generic: boolean, email: boolean, chat: boolean, handle: boolean): string {
    const parts: string[] = [...FIXED_SCOPES]
    if (generic) parts.push(SCOPE_GENERIC)
    if (email) parts.push(SCOPE_EMAIL)
    if (chat) parts.push(SCOPE_CHAT)
    if (handle) parts.push(SCOPE_HANDLE)
    return parts.join(" ")
}

function parseOptionalScopes(scopeString: string) {
    const tokens = scopeString.trim().split(/\s+/).filter(Boolean)
    return {
        chat: tokens.includes(SCOPE_CHAT),
        handle: tokens.includes(SCOPE_HANDLE),
        generic: tokens.includes(SCOPE_GENERIC),
        email: tokens.includes(SCOPE_EMAIL),
    }
}

function PermissionRow({
    title,
    description,
    checked,
    onCheckedChange,
    disabled,
}: {
    title: string
    description: string
    checked: boolean
    onCheckedChange: (v: boolean) => void
    disabled?: boolean
}) {
    return (
        <div
            className={cn(
                "flex flex-row items-start justify-between gap-3 rounded-lg border border-[var(--accent-dark)] bg-[var(--background)] p-3",
                disabled && "opacity-60",
            )}
        >
            <div className="min-w-0 flex-1 space-y-1">
                <div className="text-sm font-medium text-[var(--foreground)]">{title}</div>
                <p className="text-xs text-[var(--text-light)] leading-snug">{description}</p>
            </div>
            <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} className="mt-0.5 shrink-0" />
        </div>
    )
}

export type AtPermissionsPanelProps = {
    loadWhen: boolean
    onAuthSuccess?: () => void
    className?: string
}

export function AtPermissionsPanel({loadWhen, onAuthSuccess, className}: AtPermissionsPanelProps) {
    const {data, isPending, isError, error} = useAPI<{value: string}>(
        "/config/at_scope",
        AT_SCOPE_CONFIG_QUERY_KEY,
        Infinity,
        loadWhen,
    )
    const [chat, setChat] = useState(true)
    const [handleScope, setHandleScope] = useState(true)
    const [generic, setGeneric] = useState(true)
    const [email, setEmail] = useState(true)
    const [saving, setSaving] = useState(false)
    const {addError} = useErrors()
    const queryClient = useQueryClient()
    const {refetch: refetchSession} = useSession()
    const onAuthSuccessRef = useRef(onAuthSuccess)
    onAuthSuccessRef.current = onAuthSuccess

    useEffect(() => {
        if (!loadWhen || !data) return
        const p = parseOptionalScopes(data.value)
        setChat(p.chat)
        setHandleScope(p.handle)
        setGeneric(p.generic)
        setEmail(p.email)
    }, [loadWhen, data])

    useEffect(() => {
        const channel = new BroadcastChannel("auth_channel")
        channel.onmessage = async event => {
            if (event.data === "auth-success") {
                onAuthSuccessRef.current?.()
                await refetchSession()
                await queryClient.invalidateQueries({queryKey: AT_SCOPE_CONFIG_QUERY_KEY})
                await queryClient.invalidateQueries({queryKey: ["conversations"]})
            }
        }
        return () => channel.close()
    }, [queryClient, refetchSession])

    async function onSave() {
        const scope = buildAtScope(generic, email, chat, handleScope)
        const popup = window.open("", "at-permissions-oauth", "width=600,height=700")
        if (!popup) {
            addError("No pudimos abrir la ventana emergente. Permití ventanas emergentes para este sitio.")
            return
        }

        setSaving(true)
        const res = await post<{scope: string}, {url: string}>("/update-permissions", {scope})
        setSaving(false)

        if (res.success === false) {
            popup.close()
            addError(res.error)
            return
        }

        popup.location.href = res.value.url
    }

    const server = data != null ? parseOptionalScopes(data.value) : null
    const unchanged =
        server != null &&
        generic === server.generic &&
        email === server.email &&
        chat === server.chat &&
        handleScope === server.handle

    return (
        <div className={cn("flex flex-col gap-4", className)}>
            <Paragraph className={"text-sm px-1"}>
                Elegí qué permisos otorgarle a Cabildo Abierto sobre tu cuenta de la Atmósfera. El acceso solo se otorga
                mientras tu sesión esté activa. Podés cambiar los permisos en cualquier momento.
            </Paragraph>

            {loadWhen && isPending && (
                <div className={"py-32"}>
                    <LoadingSpinner />
                </div>
            )}

            {loadWhen && isError && (
                <p className="text-sm text-red-600 dark:text-red-400">{error?.message ?? "No se pudo cargar la configuración."}</p>
            )}

            {loadWhen && data != null && (
                <div className="space-y-3">
                    <div className="space-y-2">
                        <PermissionRow
                            title="Acceso básico"
                            description="Permite la modificación de registros en tu cuenta de la Atmósfera y el uso de servicios de otras apps. Es necesario para el funcionamiento de Cabildo Abierto."
                            checked={generic}
                            onCheckedChange={setGeneric}
                        />
                        <PermissionRow
                            title="Correo eléctronico"
                            description="Permite a Cabildo Abierto conocer cuál es tu dirección de correo electrónico."
                            checked={email}
                            onCheckedChange={setEmail}
                        />
                        <PermissionRow
                            title="Mensajes privados (DM)"
                            description="Permite usar los mensajes directos de Bluesky y otras apps de la Atmósfera desde Cabildo Abierto (leer conversaciones y enviar mensajes)."
                            checked={chat}
                            onCheckedChange={setChat}
                        />
                        <PermissionRow
                            title="Cambiar el nombre de usuario (handle)"
                            description="Permite cambiar tu nombre de usuario desde la página de configuración."
                            checked={handleScope}
                            onCheckedChange={setHandleScope}
                        />
                    </div>

                    <BaseButton
                        type="button"
                        size={"default"}
                        variant="outlined"
                        className="w-full"
                        disabled={saving || unchanged}
                        loading={saving}
                        onClick={() => void onSave()}
                    >
                        Guardar cambios
                    </BaseButton>
                </div>
            )}
        </div>
    )
}
