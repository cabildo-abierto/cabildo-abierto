"use client"

import {useEffect, useState} from "react"
import {useParams} from "next/navigation"
import {CustomLink as Link} from "@/components/utils/base/custom-link"
import {LoadingSpinner} from "@/components/utils/base/loading-spinner"
import {get, post} from "@/components/utils/react/fetch"
import {Paragraph} from "@/components/utils/base/paragraph"
import {BaseTextField} from "@/components/utils/base/base-text-field"
import {StateButton} from "@/components/utils/base/state-button"
import {Note} from "@/components/utils/base/note"
import {getPasswordStrength} from "@cabildo-abierto/utils"
import {EyeClosedIcon, EyeIcon} from "@phosphor-icons/react"
import {BaseIconButton} from "@/components/utils/base/base-icon-button"
import type {RecoverPasswordTokenData, RecoveryPdsType, ResetPasswordBody} from "@cabildo-abierto/api"
import {PageFrame} from "@/components/utils/page-frame";

type Result = "loading" | RecoveryPdsType | "error" | "success"

const pwStrLabel = ["muy débil", "débil", "regular", "fuerte", "muy fuerte"]

export default function RecuperarClavePage() {
    const params = useParams()
    const token = typeof params.token === "string" ? params.token : ""
    const [result, setResult] = useState<Result>("loading")
    const [tokenData, setTokenData] = useState<RecoverPasswordTokenData | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    useEffect(() => {
        if (!token) {
            setResult("error")
            setErrorMessage("Enlace inválido.")
            return
        }

        get<RecoverPasswordTokenData>(`/recover-password-token?token=${encodeURIComponent(token)}`)
            .then((res) => {
                if (res.success === true) {
                    setTokenData(res.value)
                    setResult(res.value.pdsType)
                } else {
                    setResult("error")
                    setErrorMessage(res.error ?? "Enlace inválido o vencido.")
                }
            })
            .catch(() => {
                setResult("error")
                setErrorMessage("Error de conexión.")
            })
    }, [token])

    if (result === "loading") {
        return (
            <PageFrame>
                <div className="flex flex-col items-center justify-center py-16">
                    <LoadingSpinner/>
                    <p className="mt-4 text-[var(--text-light)]">Verificando enlace...</p>
                </div>
            </PageFrame>
        )
    }

    if (result === "error") {
        return (
            <PageFrame>
                <div className="flex flex-col items-center pb-16 pt-8 px-4">
                    <div className="font-light max-w-md w-full">
                        <h1 className="text-xl font-semibold mb-4 normal-case">Enlace inválido o vencido</h1>
                        <p className="mb-4">{errorMessage}.</p>
                    </div>
                </div>
            </PageFrame>
        )
    }

    if (result === "cabildo" && tokenData) {
        return (
            <PageFrame>
                <CabildoResetForm handle={tokenData.handle} token={token}/>
            </PageFrame>
        )
    }

    if (result === "bsky" && tokenData) {
        return (
            <PageFrame>
                <div className="flex flex-col items-center py-16 px-4">
                    <div className="font-light max-w-md w-full">
                        <h1 className="text-xl font-semibold mb-4 normal-case">Recuperar contraseña</h1>
                        <Paragraph className="mb-4">
                            Tu cuenta <strong>@{tokenData.handle}</strong> está en Bluesky.
                        </Paragraph>
                        <Paragraph className="mb-4">
                            <a
                                href="https://bsky.app/settings/account"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-[var(--text-light)]"
                            >
                                Cambiá tu contraseña en Bluesky
                            </a>
                            .
                        </Paragraph>
                        <Link href="/apps/web/public" className="underline hover:text-[var(--text-light)]">
                            Volver a inicio
                        </Link>
                    </div>
                </div>
            </PageFrame>
        )
    }

    if (result === "other" && tokenData) {
        return (
            <div className="flex flex-col items-center py-16 px-4">
                <div className="font-light max-w-md w-full">
                    <h1 className="text-xl font-semibold mb-4 normal-case">Recuperar contraseña</h1>
                    <Paragraph className="mb-4">
                        Tu cuenta <strong>@{tokenData.handle}</strong> está alojada en otro servidor. Usá ese servicio
                        para cambiar tu contraseña.
                    </Paragraph>
                    <Link href="/apps/web/public" className="underline hover:text-[var(--text-light)]">
                        Volver a inicio
                    </Link>
                </div>
            </div>
        )
    }

    return null
}

function CabildoResetForm({handle, token}: { handle: string; token: string }) {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [pwVisible, setPwVisible] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState(false)

    const pwStr = getPasswordStrength(password)
    const validPw = password.length > 0 && pwStr >= 3
    const match = password === confirmPassword
    const canSubmit = validPw && match

    async function onSubmit() {
        if (!canSubmit) return {error: "La contraseña debe ser fuerte y coincidir."}
        const res = await post<ResetPasswordBody>("/reset-password", {token, newPassword: password})
        if (res.success === true) {
            setSubmitSuccess(true)
            return {}
        }
        return {error: res.error ?? "Ocurrió un error al cambiar la contraseña."}
    }

    if (submitSuccess) {
        return (
            <div className="flex flex-col items-center pb-16 px-4">
                <div className="font-light max-w-md w-full">
                    <h1 className="text-xl font-semibold mb-4 normal-case">Contraseña actualizada</h1>
                    <Paragraph className="mb-4 text-sm">
                        Tu contraseña se actualizó correctamente. Ya podés iniciar sesión.
                    </Paragraph>
                    <Link href="/login" className="text-sm underline hover:text-[var(--text-light)]">
                        Ir a inicio de sesión
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center pb-16 px-4">
            <div className="font-light max-w-md w-full space-y-4">
                <h1 className="text-xl font-semibold normal-case">Nueva contraseña</h1>
                <Paragraph className={"text-sm"}>
                    Elegí una nueva contraseña para <strong>@{handle}</strong>.
                </Paragraph>
                <BaseTextField
                    value={password}
                    type={pwVisible ? "text" : "password"}
                    onChange={(e) => setPassword(e.target.value)}
                    label="Contraseña"
                    placeholder=""
                    endIcon={
                        <BaseIconButton
                            size="small"
                            className="rounded-full mr-1"
                            onClick={() => setPwVisible(!pwVisible)}
                        >
                            {!pwVisible ? <EyeIcon/> : <EyeClosedIcon/>}
                        </BaseIconButton>
                    }
                />
                {password.length > 0 && (
                    <Note className="text-xs text-left">
                        La contraseña es {pwStrLabel[pwStr]}.
                        {pwStr < 3 && " Elegí una contraseña más fuerte."}
                    </Note>
                )}
                <BaseTextField
                    value={confirmPassword}
                    type="password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    label="Confirmar contraseña"
                    placeholder=""
                />
                {confirmPassword.length > 0 && !match && (
                    <Note className="text-xs text-left text-red-600">Las contraseñas no coinciden.</Note>
                )}
                <StateButton variant={"outlined"} size={"small"} handleClick={onSubmit} disabled={!canSubmit}>
                    Cambiar contraseña
                </StateButton>
            </div>
        </div>
    )
}
