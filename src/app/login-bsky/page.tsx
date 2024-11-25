"use client"
import { Button, TextField } from "@mui/material"
import { useContext, useState } from "react"
import { isValidHandle } from '@atproto/syntax'
import { createClient, resolveHandle, resolvePDSClient } from "../../services/clientUtils"
import { SessionContext } from '../../contexts/SessionContext'


const Page = () => {
    const [handle, setHandle] = useState("")
    const [password, setPassword] = useState("")
    const manager = useContext(SessionContext)

    async function handleSubmit(){

        const entrywayClient = createClient('bsky.social')
        let did
        if (isValidHandle(handle)) {
            did = await resolveHandle(handle, entrywayClient)
            console.log("did", did)
        }
    
        const pds = await resolvePDSClient(handle, entrywayClient)
        if (pds === undefined) {
          throw new Error('Unable to resolve PDS')
        }
        const client = createClient(pds)
        await manager.createSession(did, password, client)

    }

    return <div className="h-screen w-screen flex flex-col items-center justify-center">

        <div className="w-[600px] flex flex-col space-y-4">
        <h1>Iniciar sesión</h1>

        <TextField
            value={handle}
            onChange={(e) => {setHandle(e.target.value)}}
            label="Handle"
        />

        <TextField
            value={password}
            onChange={(e) => {setPassword(e.target.value)}}
            label="Contraseña"
        />

        <div className="flex justify-end w-full">
            <Button
                onClick={handleSubmit}
            >
                Iniciar sesión
            </Button>
        </div>
        </div>
    </div>
}


export default Page