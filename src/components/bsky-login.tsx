"use client"
import { Button, TextField } from "@mui/material"
import { useContext, useState } from "react"
import { isValidHandle } from '@atproto/syntax'
import { createClient, resolveHandle, resolvePDSClient } from "../services/clientUtils"
import { SessionContext } from '../contexts/SessionContext'
import { useRouter } from "next/navigation"
import { useSWRConfig } from "swr"
import StateButton from "./state-button"
import { login } from "../actions/auth"
import Link from "next/link"
import { BlueskyLogo } from "./icons"
import { Logo } from "./logo"
import { createNewCAUserForBskyAccount } from "../actions/users"


export const BlueskyLogin = () => {
    const [handle, setHandle] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState(undefined)
    const [method, setMethod] = useState("ca")
    const manager = useContext(SessionContext)
    const router = useRouter()
    const {mutate} = useSWRConfig()

    async function handleSubmit(){
        setError(undefined)

        if(method == "ca"){
            const result = await login(handle, password)
            if(result.user){
                await mutate("/api/user", result)
                router.push("/inicio")
            } else if(result.error == "not defined yet"){
                await mutate("/api/user", result)
                router.push("/inicio")
            }
            return result
        }

        const entrywayClient = createClient('bsky.social')
        let did
        if (isValidHandle(handle)) {
            try {
                did = await resolveHandle(handle, entrywayClient)
            } catch (error) {
                setError("Ocurrió un error al buscar ese nombre de usuario.")
                return {}
            }
        } else {
            setError("Ese nombre de usuario no es válido.")
            return {}
        }
        
        let pds
        try {
            pds = await resolvePDSClient(handle, entrywayClient)
        } catch {
            setError("Ocurrió un error al buscar los datos de ese usuario.")
            return {}
        }

        if (pds === undefined) {
            setError("No se encontraron los datos de ese usuario.")
        }
        const client = createClient(pds)
        
        try {
            const result = await manager.createSession(did, password, client)

            if(result){
                //await mutate("/api/user", result)
                const {error} = await createNewCAUserForBskyAccount(result.did)
                if(error){
                    await manager.deleteSession(did, client)
                    setError("Ocurrió un error al iniciar sesión. Volvé a intentar.")
                }
                router.push("/inicio")
            } else {
                //await mutate("/api/user", result)
                setError("Usuario o contraseña incorrectos.")
            }

        } catch (error) {
            setError("Usuario o contraseña incorrectos.")
        }

        return {}
    }

    return <div className="w-screen flex justify-center">
        <div className="max-w-[450px] w-full flex flex-col items-center space-y-4 px-2 mb-4">
            <h1 className="mb-8">Iniciar sesión</h1>

            {method == "ca" ? 
                <TextField
                    value={handle}
                    fullWidth={true}
                    onChange={(e) => {setHandle(e.target.value)}}
                    label="Email"
                /> :
                <TextField
                    value={handle}
                    fullWidth={true}
                    onChange={(e) => {setHandle(e.target.value)}}
                    label="Nombre de usuario de Bluesky (sin el @)"
                />
            }

            <TextField
                value={password}
                fullWidth={true}
                onChange={(e) => {setPassword(e.target.value)}}
                label="Contraseña"
            />

            <div className="flex justify-end w-full">
                <StateButton
                    variant="contained"
                    disableElevation={true}
                    size="large"
                    handleClick={handleSubmit}
                    text1="Iniciar sesión"
                />
            </div>

            {error && <div className="text-red-500 sm:text-base text-sm">{error}</div>}

            {method == "ca" && <div>
                <div className='mt-2 text-center'>
                <Link href="https://bsky.app" className="link2">Recuperar contraseña</Link>.
                </div>
                <div className='text-center mx-2'>
                    ¿No tenés una cuenta? <Link className="link2" href="/signup">Registrate</Link>.
                </div>
                </div>
            }

            <div className="pt-4">
                <Button
                    variant="outlined"
                    onClick={() => {setMethod(method == "ca" ? "bsky" : "ca")}}
                    endIcon={method == "ca" ? <BlueskyLogo className="w-7 h-7"/> : <Logo className="w-7 h-7"/>}
                    sx={{textTransform: "none"}}
                    disableElevation={true}
                >
                    {method == "ca" ? "Iniciar sesión con Bluesky" : "Iniciar sesión con Cabildo Abierto"}
                </Button>
            </div>

        </div>
    </div>
}