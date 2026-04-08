"use client"
import React, {useEffect, useState} from "react";
import {PageFrame} from "@/components/utils/page-frame";
import {post} from "@/components/utils/react/fetch";
import {BaseTextField} from "@/components/utils/base/base-text-field";
import {StateButton} from "@/components/utils/base/state-button";
import {Note} from "@/components/utils/base/note";
import type {RequestPasswordRecoveryBody} from "@cabildo-abierto/api";


export default function Page() {
    return <PageFrame>

        <RecoverPasswordSection/>
    </PageFrame>
}


const VERIFICATION_COOLDOWN_SECONDS = 30

function RecoverPasswordSection() {
    const [account, setAccount] = useState("")
    const [lastSendAt, setLastSendAt] = useState<number | null>(null)
    const [cooldownRemaining, setCooldownRemaining] = useState(0)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
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

    async function onSubmit() {
        const res = await post<RequestPasswordRecoveryBody>("/request-password-recovery", {account: account.trim()})
        console.log("res", res)
        if (res.success === true) {
            setLastSendAt(Date.now())
            setSuccess(true)
            return {}
        }
        return {error: res.error ?? "Ocurrió un error."}
    }

    const canSend = cooldownRemaining === 0

    return (
        <div className="flex justify-center">
            <div className="space-y-4 max-w-80">
                <h2 className="text-base font-medium normal-case text-center">Recuperar contraseña</h2>

                <div className="flex flex-col items-start gap-3">
                    <p className="text-sm text-[var(--text-light)]">
                        Ingresá tu nombre de usuario (ej. usuario.bsky.social) o correo electrónico. Si la cuenta existe te vamos a enviar un correo.
                    </p>
                    <BaseTextField
                        className=""
                        value={account}
                        onChange={(e) => setAccount(e.target.value)}
                        placeholder="usuario o correo..."
                        label=""
                    />
                    <StateButton
                        variant={"outlined"}
                        size={"small"}
                        handleClick={onSubmit}
                        disabled={!account.trim() || !canSend}
                        className=""
                    >
                        {canSend ? "Enviar enlace" : `Esperá ${cooldownRemaining} s`}
                    </StateButton>
                </div>
                {success && (
                    <Note className="text-left">
                        ¡Se envió el correo!
                    </Note>
                )}
            </div>
        </div>
    )
}