"use client"
import Link from "next/link"
import {BlueskyLogin} from "./bsky-login"
import {Logo} from "../../../modules/ui-utils/src/logo"
import {useRouter, useSearchParams} from "next/navigation";
import {LuPartyPopper} from "react-icons/lu";
import {BackButton} from "../../../modules/ui-utils/src/back-button";
import {Button} from "../../../modules/ui-utils/src/button";


export const Login = () => {
    const params = useSearchParams()
    const inviteCode = params.get("c")
    const router = useRouter()

    return <div className="flex flex-col items-center">

        <div className={"bg-[var(--background-dark)] sm:rounded-lg px-4 space-y-4 sm:h-auto sm:mt-10 flex flex-col items-center sm:w-auto w-screen h-screen"}>
            <div className={"flex justify-start w-full text-[var(--text-light)] mt-2"}>
                <BackButton defaultURL={"/presentacion"} preferReferrer={false} color={"background-dark"}/>
            </div>

            <div className="mb-2 mt-4 space-y-4">
                <Logo width={60} height={60}/>
                <h1 className={"text-2xl"}>Iniciar sesión</h1>
            </div>

            <div className="flex justify-center sm:px-8">
                <div className="w-full flex flex-col items-center space-y-4 px-2 mb-4">

                    {inviteCode && <div
                        className={"flex flex-col space-y-4 items-center bg-[var(--background-dark2)] max-w-80 text-center rounded p-4"}>
                        <div className={"text-[var(--text-light)] text-lg"}>
                            <LuPartyPopper fontSize={"22px"}/>
                        </div>
                        <div className={"text-lg"}>
                            ¡Recibiste un código de invitación!
                        </div>
                        <div className={"text-sm text-[var(--text-light)]"}>
                            Si ya tenés una cuenta de Bluesky, iniciá sesión. Si no, podés crearla <Link
                            className={"link2"} target={"_blank"} href={"https://bsky.app"}>acá</Link>.
                        </div>
                    </div>}

                    <div className={"max-w-[360px]"}>
                        <BlueskyLogin inviteCode={inviteCode}/>
                    </div>

                    <div className='text-center text-[var(--text-light)] mx-2'>
                        ¿No tenés una cuenta? <Link className="link2" target="_blank" href="https://bsky.app">Registrate
                        en
                        Bluesky</Link>.
                    </div>

                    <div className={"pt-8"} onClick={() => {
                        router.push("/presentacion" + (inviteCode ? `?c=${inviteCode}` : ""))
                    }}>
                        <Button color={"background-dark"}>
                            <span className={"font-semibold text-[13px]"}>Conocer más</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
}