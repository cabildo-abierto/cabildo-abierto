"use client"
import Link from "next/link"
import { BlueskyLogin } from "./bsky-login"
import { TopbarLogo } from "../ui-utils/logo"
import {useSearchParams} from "next/navigation";
import {useCodes} from "../../hooks/user";
import LoadingSpinner from "../ui-utils/loading-spinner";
import { LuPartyPopper } from "react-icons/lu";



export const Login = () => {
    const params = useSearchParams()
    const {codes} = useCodes()

    const inviteCode = params.get("c")

    if(inviteCode && !codes){
        return <div className={"mt-8"}><LoadingSpinner/></div>
    }

    if(inviteCode){
        if(!codes.includes(inviteCode)){
            return <div className={"space-y-4 text-center flex flex-col justify-center h-full"}>
                <div className={"text-[var(--text-light)] text-lg"}>
                    Tu código de invitación expiró o es inválido.
                </div>
                <div>
                    <Link href="/login" className={"link3"}>Volver</Link>
                </div>
            </div>
        }
    }

    return <div className="flex flex-col items-center sm:w-[600px] py-10">
        <div className="mb-2">
            <TopbarLogo className="w-20 h-20 m-2"/>
        </div>

        <div className="flex justify-center">
            <div className="sm:min-w-[500px] w-full flex flex-col items-center space-y-4 px-2 mb-4">
                <h1>Iniciar sesión</h1>

                {inviteCode && <div className={"flex flex-col space-y-4 items-center bg-[var(--background-dark)] max-w-80 text-center rounded p-4"}>
                    <div className={"text-[var(--text-light)] text-lg"}>
                        <LuPartyPopper fontSize={"22px"}/>
                    </div>
                    <div className={"text-lg"}>
                        ¡Recibiste un código de invitación!
                    </div>
                    <div className={"text-sm text-[var(--text-light)]"}>
                        Si ya tenés una cuenta de Bluesky, iniciá sesión. Si no, podés crearla <Link className={"link2"} target={"_blank"} href={"https://bsky.app"}>acá</Link>.
                    </div>
                </div>}

                <BlueskyLogin inviteCode={inviteCode}/>

                <div className='text-sm text-center text-[var(--text-light)] mx-2'>
                    ¿No tenés una cuenta? <Link className="link2" target="_blank" href="https://bsky.app">Registrate en
                    Bluesky</Link>.
                </div>

                <div className={"w-full link flex justify-center text-sm"}>
                    <Link href={"/public"}>Volver al inicio</Link>
                </div>
            </div>
        </div>
    </div>
}