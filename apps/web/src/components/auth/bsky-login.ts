import {useEffect, useState} from "react"
import {isValidHandle} from "@atproto/syntax"
import {useSession} from "./use-session";
import {usePathname, useRouter} from "next/navigation";
import * as React from "react";
import {fetchBackend} from "@/components/utils/react/fetch";


function getHandleFromInputs(handleStart: string, domain: string) {
    if (handleStart.length > 0 && domain.length > 0 && !handleStart.endsWith(".") && !domain.startsWith(".")) {
        domain = `.${domain}`
    }
    return (handleStart.trim() + domain.trim()).replaceAll("@", "")
}


export function useBlueskyLogin({
                                    inviteCode,
                                    onLogin
                                }: {
    inviteCode?: string
    onLogin?: () => void
}) {
    const [error, setError] = useState<null | string>(null)
    const [isLoading, setIsLoading] = useState(false)
    const {refetch} = useSession(inviteCode)
    const [handleStart, setHandleStart] = useState("")
    const [domain, setDomain] = useState(".bsky.social")
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        const channel = new BroadcastChannel("auth_channel")
        channel.onmessage = (event) => {
            if (event.data === "auth-success") {
                refetch()
                if (pathname.startsWith("/presentacion")) {
                    router.push("/inicio")
                }
                if(onLogin) onLogin()
            }
        }
        return () => channel.close()
    }, [refetch])

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        setError(null)

        const handle = getHandleFromInputs(handleStart, domain)
        if (!isValidHandle(handle)) {
            setError("El nombre de usuario es inválido.")
            return
        }

        const popup = window.open('', 'bluesky-login', `width=600,height=700`)

        if(!popup) {
            setError("No pudimos abrir la ventana emergente.")
            return
        }

        setIsLoading(true)
        const res = await fetchBackend({
            route: "/login",
            method: "POST",
            credentials: "include",
            body: {handle, code: inviteCode},
            redirect: "follow"
        })

        if (!res.ok) {
            popup.close();
            setError("Error de conexión.");
            setIsLoading(false);
            return;
        }

        const body = await res.json();
        if (body.error) {
            popup.close();
            setError(body.error);
            setIsLoading(false);
            return;
        }

        popup.location.href = body.data.url;
        setIsLoading(false)
    }


    return {
        handleSubmit,
        error,
        setError,
        isLoading,
        setHandleStart: (handle: string) => {
            setHandleStart(handle)
            setError(null)
        },
        setDomain: (handle: string) => {
            setDomain(handle)
            setError(null)
        },
        domain,
        handleStart
    }
}