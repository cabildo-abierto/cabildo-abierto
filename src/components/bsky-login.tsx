"use client"
import { TextField } from "@mui/material"
import { useState } from "react"
import StateButton from "./state-button"
import { login } from "../actions/auth"
import { useRouter } from "next/navigation"


export const BlueskyLogin = ({newTab=false}: {newTab?: boolean}) => {
    const [handle, setHandle] = useState("")
    const [error, setError] = useState(undefined)
    const router = useRouter()

    async function handleSubmit(){
        const res = await login(handle)

        if(res && res.error){
            setError(res.error)
        }

        const url = res.url
        
        if(newTab){
            window.open(url, '_blank')
        } else {
            router.push(url)
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