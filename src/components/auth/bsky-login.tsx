"use client"
import {useEffect, useState} from "react"
import {isValidHandle} from "@atproto/syntax"
import {useSession} from "@/queries/getters/useSession";
import {BaseButton} from "../layout/base/baseButton"
import {backendUrl} from "@/utils/uri";
import {AtIcon} from "@phosphor-icons/react";
import { BaseTextField } from "../layout/base/base-text-field";
import {usePathname, useRouter} from "next/navigation";
import {useLoginModal} from "@/components/layout/login-modal-provider";
import { Note } from "../layout/utils/note";
import {FieldError} from "@/components/ui/field";
import * as React from "react";


function getHandleFromInputs(handleStart: string, domain: string) {
    if(handleStart.length > 0 && domain.length > 0 && !handleStart.endsWith(".") && !domain.startsWith(".")) {
        domain = `.${domain}`
    }
    return (handleStart.trim() + domain.trim()).replaceAll("@", "")
}


export const BlueskyLogin = ({inviteCode}: { inviteCode?: string }) => {
    const [error, setError] = useState(undefined)
    const [isLoading, setIsLoading] = useState(false)
    const {refetch} = useSession(inviteCode)
    const [handleStart, setHandleStart] = useState("")
    const [domain, setDomain] = useState(".bsky.social")
    const pathname = usePathname()
    const router = useRouter()
    const {setLoginModalOpen} = useLoginModal()

    useEffect(() => {
        const channel = new BroadcastChannel("auth_channel")
        channel.onmessage = (event) => {
            if (event.data === "auth-success") {
                refetch()
                if(pathname.startsWith("/presentacion")){
                    router.push("/inicio")
                }
                setLoginModalOpen(false)
            }
        }
        return () => channel.close()
    }, [refetch])

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);

        const handle = getHandleFromInputs(handleStart, domain);
        if (!isValidHandle(handle)) {
            setError(`El nombre de usuario es inválido.`)
            return
        }

        const popup = window.open('', 'bluesky-login', `width=600,height=700`)

        setIsLoading(true)
        const res = await fetch(backendUrl + "/login", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ handle, code: inviteCode }),
            redirect: "follow"
        });

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

    return <div className={"max-w-96 w-full"}>
        <form
            action={"/login"}
            autoComplete={"on"}
            onSubmit={handleSubmit}
            className={"space-y-4"}
        >
            <div className={"space-y-2"}>
                <div className={"flex space-x-2 items-center"}>
                    <BaseTextField
                        name="ca_username"
                        id="ca_username"
                        autoComplete="username"
                        label="Nombre de usuario"
                        autoFocus
                        value={handleStart}
                        onChange={(e) => {
                            setHandleStart(e.target.value);
                            setError(undefined);
                        }}
                        startIcon={<span className={"text-[var(--text-light)] pt-[2px]"}><AtIcon/></span>}
                    />
                    <BaseTextField
                        id="domain"
                        label="Dominio"
                        placeholder=".bsky.social"
                        autoFocus={false}
                        autoComplete="off"
                        value={domain}
                        onChange={(e) => {
                            setDomain(e.target.value);
                            setError(undefined);
                        }}
                        className={"w-40"}
                    />
                </div>
                {error && <FieldError>
                    {error}
                </FieldError>}
                <Note text={"text-xs"}>
                    Tu cuenta de Cabildo Abierto y Bluesky es la misma.
                </Note>
            </div>
            <BaseButton
                type="submit"
                loading={isLoading}
                variant="outlined"
                className={"w-full"}
            >
                Iniciar sesión
            </BaseButton>
        </form>

    </div>
}