"use client"
import {Box, FormHelperText, TextField} from "@mui/material"
import {useEffect, useState} from "react"
import {FormControl} from '@mui/material';
import {isValidHandle} from "@atproto/syntax"
import {useSession} from "@/queries/useSession";
import {Button} from "../../../modules/ui-utils/src/button"
import {backendUrl} from "@/utils/uri";


export const BlueskyLogin = ({inviteCode}: { inviteCode?: string }) => {
    const [error, setError] = useState(undefined)
    const [isLoading, setIsLoading] = useState(false)
    const {refetch} = useSession(inviteCode)
    const [handleStart, setHandleStart] = useState("")
    const [domain, setDomain] = useState(".bsky.social")

    useEffect(() => {
        const channel = new BroadcastChannel("auth_channel")
        channel.onmessage = (event) => {
            if (event.data === "auth-success") {
                refetch()
            }
        }
        return () => channel.close()
    }, [refetch])

    async function handleSubmit(e) {
        e.preventDefault();

        setError(null)

        const handle = (handleStart.trim() + domain.trim()).replaceAll("@", "")

        if (!isValidHandle(handle)) {
            setError('Nombre de usuario inválido.')
            return
        }

        setIsLoading(true)
        const res = await fetch(backendUrl + "/login", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({handle, code: inviteCode}),
            redirect: "follow", // ensure browser follows the redirect
        })

        if (!res.ok) {
            setError("Error de conexión.")
            setIsLoading(false)
            return
        }

        const body = await res.json() as { error?: string, data?: { url: string } }

        if (body.error) {
            setError(body.error)
            setIsLoading(false)
            return
        }

        const url = body.data.url

        const width = 600;
        const height = 700;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        window.open(url, 'bluesky-login', `width=${width},height=${height},left=${left},top=${top}`);
    }

    return <div className={"max-w-96 w-full"}>
        <Box component={"form"} onSubmit={handleSubmit} sx={{width: "100%"}} className={"space-y-2"}>
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
                        variant="outlined"
                        autoComplete="off"
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
                fullWidth={true}
                loading={isLoading}
                size="medium"
                variant="contained"
                color={"primary"}
            >
                <span className={"font-semibold text-[14px]"}>Iniciar sesión</span>
            </Button>
        </Box>
    </div>
}