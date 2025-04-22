"use client"
import {Box, FormHelperText, TextField} from "@mui/material"
import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import { FormControl } from '@mui/material';
import { isValidHandle } from "@atproto/syntax"
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {mutate} from "swr";
import {useSession} from "@/hooks/swr";
import { Button } from "../../../modules/ui-utils/src/button"


export const assignInviteCode = async (c: string) => {
    return {error: "Sin implementar."}
}


export const BlueskyLogin = ({inviteCode}: {inviteCode?: string}) => {
    const [error, setError] = useState(undefined)
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const {user} = useSession(true)
    const [usingInviteCode, setUsingInviteCode] = useState(false)
    const [handleStart, setHandleStart] = useState("")
    const [domain, setDomain] = useState(".bsky.social")

    async function handleSubmit(e){
        e.preventDefault();

        setError(null)

        const handle = handleStart + domain

        if (!isValidHandle(handle)) {
            if(handle.includes("@")){
                setError("Nombre de usuario inválido. Escribilo sin @.")
            } else if(!handle.includes(".bsky.social")){
                setError('Nombre de usuario inválido.')
            }
            return
        }

        setIsLoading(true)
        const res = await fetch("http://127.0.0.1:8080/login", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ handle }),
            redirect: "follow", // ensure browser follows the redirect
        })

        if(!res.ok){
            console.log("Response:", res)
            setError("Ocurrió un error al iniciar sesión.")
            setIsLoading(false)
            return
        }

        const url = (await res.json() as {url: string}).url
        
        const width = 600;
        const height = 700;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        //window.open(url, 'bluesky-login', `width=${width},height=${height},left=${left},top=${top}`);
        router.push(url)
    }

    useEffect(() => {
        async function activateInviteCode(){
            setUsingInviteCode(true)
            const {error} = await assignInviteCode(inviteCode)
            if(error){
                setError(error)
            } else {
                mutate("/api/user", {})
            }
        }

        if(user && user.did){
            if(inviteCode && !user.hasAccess && !user.usedInviteCode){
                activateInviteCode()
            }

            router.push("/inicio")
        }
    }, [user, inviteCode, router])

    if(usingInviteCode){
        return <div className={"flex flex-col items-center space-y-2"}>
            <div>
                Cargando código de invitación.
            </div>
            <LoadingSpinner/>
        </div>
    }

    return <div className={"max-w-96 w-full"}>
        <Box component={"form"} onSubmit={handleSubmit} sx={{width: "100%"}}>
            <FormControl error={error} sx={{width: "100%"}}>
                <div className={"flex space-x-2 items-center"}>
                    <TextField
                        margin="normal"
                        fullWidth={true}
                        size={"small"}
                        id="username"
                        label="Nombre de usuario de Bluesky"
                        name="username"
                        autoFocus
                        autoComplete="off"
                        variant="outlined"
                        value={handleStart}
                        onChange={(e) => {
                            setHandleStart(e.target.value);
                            setError(undefined);
                        }}
                    />
                    <TextField
                        margin="normal"
                        fullWidth={false}
                        id="domain"
                        label="Dominio"
                        name="username"
                        placeholder=".bsky.social"
                        autoFocus={false}
                        autoComplete="off"
                        variant="outlined"
                        size={"small"}
                        value={domain}
                        onChange={(e) => {
                            setDomain(e.target.value);
                            setError(undefined);
                        }}
                        sx={{
                            width: 160
                        }}
                    />
                </div>

                <FormHelperText
                    hidden={error == undefined}
                    id="my-helper-text"
                >
                    {error}
                </FormHelperText>
            </FormControl>
            <Button
                type="submit"
                loading={isLoading}
                fullWidth
                size="large"
                variant="contained"
                color={"primary"}
                sx={{
                    mt: 3,
                    mb: 2,
                    textTransform: "none",
                    borderRadius: 20
                }}
            >
                Iniciar sesión
            </Button>
        </Box>
    </div>
}