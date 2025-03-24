"use client"
import {ReactNode, useEffect, useState} from "react";
import {useBskyUser, useCodes, useUser} from "../../hooks/user";
import {getUsername} from "../utils/utils";
import {TextField} from "@mui/material";
import {CloseSessionButton} from "./close-session-button";
import StateButton from "../ui-utils/state-button";
import {updateEmail} from "../../actions/user/users";
import Link from "next/link";
import Footer from "../ui-utils/footer";
import {mutate, useSWRConfig} from "swr";
import {ProfileViewDetailed} from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import {LoadingScreen} from "../ui-utils/loading-screen";
import {useSearchParams} from "next/navigation";
import {assignInviteCode} from "../../actions/user/access";


function getUsernameBskyUser(user: ProfileViewDetailed){
    return user.displayName ? user.displayName : user.handle ? user.handle : user.did
}


export const BetaAccessPageNotCAUserAccess = () => {
    const {bskyUser, isLoading: loadingBskyUser} = useBskyUser()
    const [email, setEmail] = useState<string>("")
    const {user, isLoading} = useUser(true)
    const [status, setStatus] = useState(user && user.email ? "email set" : "no email")
    const {mutate} = useSWRConfig()

    if(isLoading || loadingBskyUser) return <LoadingScreen />

    async function handleSave(){
        const {error} = await updateEmail(email)
        if(error) return {error}
        setStatus("email set")
        await mutate("/api/user")
        return {}
    }

    if(!bskyUser) return null

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

        <div className={"mt-24 text-[var(--text-light)] w-full"}>
            <Footer showCA={false}/>
        </div>
    </div>
}


export const BetaAccessPage = ({children}: {children: ReactNode}) => {
    const {user, isLoading} = useUser(true)
    const searchParams = useSearchParams()
    const {codes, isLoading: codesLoading} = useCodes()
    const [usingInviteCode, setUsingInviteCode] = useState(false)

    const inviteCode = searchParams.get("c")

    useEffect(() => {
        async function activateInviteCode(){
            setUsingInviteCode(true)
            const {error} = await assignInviteCode(inviteCode)
            if(!error){
                mutate("/api/user", {})
            }
            setUsingInviteCode(false)
        }

        if(inviteCode && user && !user.hasAccess && codes){
            if(codes.includes(inviteCode)){
                activateInviteCode()
            }
        }
    }, [searchParams, codes, user])

    if(user && user.hasAccess) return <>{children}</>

    if(isLoading || inviteCode && codesLoading || usingInviteCode){
        return <LoadingScreen/>
    }

    return <BetaAccessPageNotCAUserAccess/>
}