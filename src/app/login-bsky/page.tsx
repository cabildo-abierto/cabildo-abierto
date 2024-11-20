"use client"
import { Button } from "@mui/material"
import { inputClassName } from "../../components/signup-form"
import { useState } from "react"




const Page = () => {
    const [handle, setHandle] = useState("")

    async function login(){
        
        const url = await oauthClient.authorize(handle, {
            scope: 'atproto transition:generic',
        })
        return res.redirect(url.toString())
    }

    return <div className="h-screen w-screen flex flex-col items-center justify-center">

        <div className="w-[600px]">
        <h1>Iniciar sesión</h1>

        <input
            className={inputClassName}
            value={handle}
            onChange={(e) => {setHandle(e.target.value)}}
        />

        <Button
            onClick={login}
        >
            Iniciar sesión
        </Button>
        </div>
    </div>
}


export default Page