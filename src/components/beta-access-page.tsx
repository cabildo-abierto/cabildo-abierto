"use client"
import {ReactNode, useState} from "react";
import {useUser} from "../app/hooks/user";
import {getUsername} from "./utils";
import {TextField} from "@mui/material";
import {CloseSessionButton} from "./close-session-button";
import StateButton from "./state-button";
import {updateEmail} from "../actions/users";
import Link from "next/link";
import Footer from "./footer";
import {useSWRConfig} from "swr";


export const BetaAccessPage = ({children}: {children: ReactNode}) => {
    const {user, bskyProfile} = useUser()
    const [email, setEmail] = useState<string>("")
    const [status, setStatus] = useState(user && user.email ? "email set" : "no email")
    const {mutate} = useSWRConfig()

    if(!user) return <></>
    if(user.hasAccess) return <>{children}</>

    async function handleSave(){
        const {error} = await updateEmail(email)
        if(error) return {error}
        setStatus("email set")
        await mutate("/api/user")
        return {}
    }

    return <div className={"flex flex-col items-center px-4"}>
        <div className={"flex justify-end sm:px-14 pt-2 w-screen"}>
            <CloseSessionButton/>
        </div>
        <h1 className={"mt-16 text-center"}>
            ¡Bienvenido/a {getUsername(bskyProfile)}!
        </h1>
        <h2 className={"text-[var(--text-light)] py-4"}>
            Gracias por registrarte
        </h2>
        <div className={"mt-16 text-lg text-center"}>Estamos dando acceso al período de prueba por orden de llegada.</div>

        <div className={"bg-[var(--background-dark)] p-4 rounded-lg mt-8"}>
            {!user.email || status == "changing email" ? <><p className={"text-[var(--text-light)]"}>
                    Dejanos tu mail así te avisamos cuando puedas acceder
                </p>
                <div className={"py-4 space-x-2 flex items-center justify-center"}>
                    <TextField
                        label="Email"
                        type="email"
                        size={"small"}
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value)
                        }}
                        fullWidth
                        variant="outlined"
                    />
                    <StateButton
                        variant={"outlined"}
                        handleClick={handleSave}
                        text1={"Guardar"}
                    />
                </div></> : <div className={"space-x-1 mt-4 flex flex-col items-center"}>
            <div className={""}>
                <div>Te vamos a escribir a <span
                    className={"text-[var(--text-light)]"}>{email ? email : user.email}</span> para avisarte cuando
                    puedas acceder.
                </div>
                <div className={"flex w-full justify-end"}>
                    <button onClick={() => {
                        setStatus("changing email")
                    }} className={"link2 text-[var(--text-light)] text-sm"}>
                        Cambiar mail
                    </button>
                    .
                </div>
            </div>
        </div>
        }
    </div>

    <div className={"text-[var(--text-light)] mt-16 text-center"}>
            Si ya tenías una cuenta de la primera versión, <Link className="link2" href={"/v1"}>hacé click acá</Link>.
        </div>

        <div className={"mt-48 text-[var(--text-light)]"}>
            <Footer showCA={false}/>
        </div>
    </div>
}