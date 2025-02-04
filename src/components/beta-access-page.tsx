"use client"
import {ReactNode, useState} from "react";
import {useBskyUser, useUser} from "../hooks/user";
import {getUsername} from "./utils";
import {TextField} from "@mui/material";
import {CloseSessionButton} from "./close-session-button";
import StateButton from "./state-button";
import {updateEmail} from "../actions/users";
import Link from "next/link";
import Footer from "./footer";
import {useSWRConfig} from "swr";
import LoadingSpinner from "./loading-spinner";
import {ProfileViewDetailed} from "@atproto/api/dist/client/types/app/bsky/actor/defs";

function getUsernameBskyUser(user: ProfileViewDetailed){
    return user.displayName ? user.displayName : user.handle ? user.handle : user.did
}


export const BetaAccessPage = ({children}: {children: ReactNode}) => {
    const {bskyUser, isLoading: bskyUserLoading} = useBskyUser()
    const {user, isLoading} = useUser()
    const [email, setEmail] = useState<string>("")
    const [status, setStatus] = useState(user && user.email ? "email set" : "no email")
    const {mutate} = useSWRConfig()

    if(isLoading || bskyUserLoading) return <div className={"mt-32"}><LoadingSpinner/></div>
    if(user && user.hasAccess) return <>{children}</>

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
        <h1 className={"mt-16 text-center text-xl lg:text-2xl"}>
            ¡Bienvenido/a {getUsernameBskyUser(bskyUser)}!
        </h1>
        <h2 className={"text-[var(--text-light)] text-lg lg:text-xl py-4"}>
            Gracias por registrarte
        </h2>
        <div className={"mt-16 text-lg text-center"}>Estamos dando acceso al período de prueba por orden de llegada.</div>

        <div className={"bg-[var(--background-dark)] p-4 rounded-lg mt-8"}>
            {(!user || !user.email || status == "changing email") ? <><p className={"text-[var(--text-light)]"}>
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
                <div className={"flex justify-center"}>
                    <button onClick={() => {
                        setStatus("changing email")
                    }} className={"link2 text-[var(--text-light)] text-sm"}>
                        Cambiar mail
                    </button>
                </div>
            </div>
        </div>
        }
    </div>

    <div className={"text-[var(--text-light)] mt-16 text-center"}>
            Si ya tenías una cuenta de la primera versión, <Link className="link2" href={"/v1"}>hacé click acá</Link>.
        </div>

        <div className={"mt-24 text-[var(--text-light)]"}>
            <Footer showCA={false}/>
        </div>
    </div>
}