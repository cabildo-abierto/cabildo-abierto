"use client"

import {useEffect, useState} from "react"
import {useParams} from "next/navigation"
import {CustomLink as Link} from "@/components/utils/base/custom-link"
import {LoadingSpinner} from "@/components/utils/base/loading-spinner"
import {get} from "@/components/utils/react/fetch"
import {Paragraph} from "@/components/utils/base/paragraph";

type Result = "loading" | "success" | "error" | "alreadyVerified"

export default function VerificarEmailPage() {
    const params = useParams()
    const token = typeof params.token === "string" ? params.token : ""
    const [result, setResult] = useState<Result>("loading")
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    useEffect(() => {
        if (!token) {
            setResult("error")
            setErrorMessage("Enlace inválido.")
            return
        }

        get<{}>(`/verify-email?token=${encodeURIComponent(token)}`)
            .then(async (res) => {
                if (res.success === true) {
                    setResult("success")
                } else {
                    const accountRes = await get<{ emailVerified?: boolean }>("/account")
                    if (accountRes.success === true && accountRes.value?.emailVerified) {
                        setResult("alreadyVerified")
                    } else {
                        setResult("error")
                        setErrorMessage(res.error ?? "Enlace inválido o vencido.")
                    }
                }
            })
            .catch(() => {
                setResult("error")
                setErrorMessage("Error de conexión.")
            })
    }, [token])

    if (result === "loading") {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <LoadingSpinner/>
                <p className="mt-4 text-[var(--text-light)]">Verificando correo...</p>
            </div>
        )
    }

    if (result === "success" || result === "alreadyVerified") {
        return (
            <div className="font-light p-6 max-w-md">
                <h1 className="text-xl font-semibold mb-4 normal-case">Correo verificado</h1>
                <Paragraph className="mb-4">
                    Tu correo electrónico fue verificado correctamente.
                </Paragraph>
                <Link href="/ajustes" className="underline hover:text-[var(--text-light)]">
                    Ir a ajustes
                </Link>
            </div>
        )
    }

    return (
        <div className="font-light p-6 max-w-md">
            <h1 className="text-xl font-semibold mb-4 normal-case">Ocurrió un error al verificar el correo</h1>
            <p className="mb-4">
                {errorMessage}.
            </p>
            <Link href="/ajustes" className="underline hover:text-[var(--text-light)]">
                Volver a ajustes
            </Link>
        </div>
    )
}
