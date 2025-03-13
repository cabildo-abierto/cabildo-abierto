"use client"
import {Box, Button, Container, FormHelperText, TextField} from "@mui/material"
import {useEffect, useState} from "react"
import { login } from "../../actions/auth"
import {useRouter} from "next/navigation"
import { FormControl } from '@mui/material';
import { isValidHandle } from "@atproto/syntax"
import {useUser} from "../../hooks/user";
import {assignInviteCode} from "../../actions/user/access";
import LoadingSpinner from "../ui-utils/loading-spinner";
import {mutate} from "swr";
import Link from "next/link";


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
            setError("Nombre de usuario inválido." + (handle.includes("@") ? " Escribilo sin @." : ""))
            return
        }

        setIsLoading(true)
        const res = await login(handle.toLowerCase(), inviteCode)

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
    }, [user, inviteCode])

    if(usingInviteCode){
        return <div className={"flex flex-col items-center space-y-2"}>
            <div>
            Cargando código de invitación.
            </div>
            <LoadingSpinner/>
        </div>
    }

    return <Container maxWidth="xs">
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: "100%" }}>
                <FormControl error={error} sx={{ width: "100%" }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Nombre de usuario de ATProto"
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
                <FormHelperText id="my-helper-text" sx={{color: "var(--text-light)"}}>
                    {/* TO DO: Reemplazar link por un tema de Cabildo Abierto */}
                    Tu nombre de usuario de Bluesky, Cabildo Abierto y cualquier otra plataforma que use ATProto. <Link target="_blank" className="link2" href={"https://es.wikipedia.org/wiki/Protocolo_AT"}>¿Qué es ATProto?</Link>
                </FormHelperText>
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
                    }}
                    disableElevation
                >
                    Iniciar sesión
                </Button>
            </Box>
        </Box>
    </Container>
}