"use client"
import { Box, Container, FormHelperText, TextField } from "@mui/material"
import { useState } from "react"
import { login } from "../actions/auth"
import { useRouter } from "next/navigation"
import { FormControl } from '@mui/material';
import { LoadingButton } from "@mui/lab"
import { isValidHandle } from "@atproto/syntax"


export const BlueskyLogin = ({newTab=false}: {newTab?: boolean}) => {
    const [handle, setHandle] = useState("")
    const [error, setError] = useState(undefined)
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false); // Loading state

    async function handleSubmit(e){
        e.preventDefault();

        if (typeof handle !== 'string' || !isValidHandle(handle)) {
            setError("Nombre de usuario inválido." + (handle.includes("@") ? " Escribilo sin @." : ""))
            return
        }

        setIsLoading(true)
        const res = await login(handle)

        if(res && res.error){
            setError(res.error)
            setIsLoading(false)
            return
        }

        const url = res.url
        
        if(newTab){
            window.open(url, '_blank')
        } else {
            router.push(url)
        }
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
                    <FormHelperText hidden={error == undefined} id="my-helper-text">
                        {error}
                    </FormHelperText>
                </FormControl>
                <FormHelperText id="my-helper-text">
                    Tu nombre de usuario de Bluesky, Cabildo Abierto y cualquier otra plataforma que use ATProto.
                </FormHelperText>
                <LoadingButton
                    type="submit"
                    loading={isLoading}
                    fullWidth
                    size="large"
                    variant="contained"
                    sx={{
                        mt: 3,
                        mb: 2,
                        textTransform: "none",
                    }}
                    disableElevation
                >
                    Iniciar sesión
                </LoadingButton>
            </Box>
        </Box>
    </Container>
}