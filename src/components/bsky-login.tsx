"use client"
import { TextField } from "@mui/material"
import { useState } from "react"
import StateButton from "./state-button"
import Link from "next/link"
import { login } from "../actions/auth"


export const BlueskyLogin = () => {
    const [handle, setHandle] = useState("")
    const [error, setError] = useState(undefined)

    async function handleSubmit(){
        const res = await login(handle)
        return res && res.error ? {error: res.error} : {}
    }

    return <div className="w-screen flex justify-center">
        <div className="max-w-[450px] w-full flex flex-col items-center space-y-4 px-2 mb-4">
            <h1 className="">Iniciar sesión</h1>

            <TextField
                value={handle}
                fullWidth={true}
                onChange={(e) => {setHandle(e.target.value)}}
                label="Nombre de usuario de Bluesky (sin el @)"
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

            <div className='text-center mx-2'>
                ¿No tenés una cuenta de Bluesky? <Link className="link2" target="_blank" href="https://bsky.app">Registrate</Link>.
            </div>

        </div>
    </div>
}