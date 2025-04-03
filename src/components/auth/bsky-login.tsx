"use client"
import {Box, FormHelperText, TextField} from "@mui/material"
import {useEffect, useState} from "react"
import { login } from "@/server-actions/auth"
import {useRouter} from "next/navigation"
import { FormControl } from '@mui/material';
import { isValidHandle } from "@atproto/syntax"
import {assignInviteCode} from "@/server-actions/user/access";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {mutate} from "swr";
import {useUser} from "@/hooks/swr";
import { Button } from "../../../modules/ui-utils/src/button"


export const BlueskyLogin = ({inviteCode}: {inviteCode?: string}) => {
    const [handle, setHandle] = useState("")
    const [error, setError] = useState(undefined)
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const {user} = useUser(true)
    const [usingInviteCode, setUsingInviteCode] = useState(false)

    async function handleSubmit(e){
        e.preventDefault();

        if (typeof handle !== 'string' || !isValidHandle(handle)) {
            if(handle.includes("@")){
                setError("Nombre de usuario inválido. Escribilo sin @.")
            } else if(!handle.includes(".bsky.social")){
                setError('Nombre de usuario inválido. Tip: Los usuarios de Bluesky suelen terminar con ".bsky.social".')
            }
            return
        }

        setIsLoading(true)
        const res = await login(handle.toLowerCase())

        if(res && res.error){
            setError(res.error)
            setIsLoading(false)
            return
        }

        const url = res.url
        
        const width = 600;
        const height = 700;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        window.open(url, 'bluesky-login', `width=${width},height=${height},left=${left},top=${top}`);
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
                <TextField
                    margin="normal"
                    fullWidth={true}
                    id="username"
                    label="Nombre de usuario de Bluesky"
                    name="username"
                    placeholder="Ej. usuario.bsky.social"
                    autoFocus
                    autoComplete="off"
                    variant="outlined"
                    value={handle}
                    onChange={(e) => {
                        setHandle(e.target.value);
                        setError(undefined);
                    }}
                />

                <FormHelperText
                    hidden={error == undefined}
                    id="my-helper-text"
                >
                    {error}
                </FormHelperText>
            </FormControl>
            {/*<FormHelperText id="my-helper-text" sx={{color: "var(--text-light)"}}>
                Tu nombre de usuario de Bluesky, Cabildo Abierto y cualquier otra plataforma que use ATProto. <Link target="_blank" className="link2" href={"https://es.wikipedia.org/wiki/Protocolo_AT"}>¿Qué es ATProto?</Link>
            </FormHelperText>*/}
            {/* TO DO: Reemplazar link por un tema de Cabildo Abierto */}
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