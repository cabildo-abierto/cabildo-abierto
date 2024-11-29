"use client"
import { TextField } from "@mui/material"
import { useState } from "react"
import StateButton from "./state-button"
import { login } from "../actions/auth"


export const BlueskyLogin = () => {
    const [handle, setHandle] = useState("")
    const [error, setError] = useState(undefined)

    async function handleSubmit(){
        const res = await login(handle)

        if(res && res.error){
            setError(res.error)
        }

        return {}
    }

    return <>
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

    </>
}