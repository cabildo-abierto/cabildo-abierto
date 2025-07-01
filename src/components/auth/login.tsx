"use client"
import Link from "next/link"
import {BlueskyLogin} from "./bsky-login"
import {Logo} from "../../../modules/ui-utils/src/logo"
import {useRouter, useSearchParams} from "next/navigation";
import {LuPartyPopper} from "react-icons/lu";
import {BackButton} from "../../../modules/ui-utils/src/back-button";
import {Button} from "../../../modules/ui-utils/src/button";
import {ReactNode, useState} from "react";
import {TextField} from "../../../modules/ui-utils/src/text-field";
import {post} from "@/utils/fetch";
import StateButton from "../../../modules/ui-utils/src/state-button";
import {AcceptButtonPanel} from "../../../modules/ui-utils/src/accept-button-panel";


const LoginPanel = ({children, onClickBack}: { children: ReactNode, onClickBack?: () => void }) => {
    return <div className="flex flex-col items-center w-screen h-screen bg-[var(--background-dark)]">
        <div
            className={"bg-[var(--background)] sm:w-[480px] sm:rounded-2xl px-4 space-y-4 sm:h-auto sm:mt-10 flex flex-col items-center w-screen h-screen"}>
            <div className={"flex justify-start w-full text-[var(--text-light)] mt-4"}>
                <BackButton defaultURL={"/presentacion"} preferReferrer={false} color={"background"} onClick={onClickBack}/>
            </div>
            {children}
        </div>
    </div>
}


export const Login = () => {
    const params = useSearchParams()
    const inviteCode = params.get("c")
    const router = useRouter()
    const [wantsAccess, setWantsAccess] = useState<boolean>(false)
    const [email, setEmail] = useState<string>("")
    const [comment, setComment] = useState<string>("")
    const [showRequestCreated, setShowRequestCreated] = useState<boolean>(false)

    async function onSendAccessRequest() {
        const {error} = await post<{}, {}>("/access-request", {email, comment})
        if(error) {
            return {error}
        } else {
            setShowRequestCreated(true)
            setComment("")
            setEmail("")
            return {}
        }
    }

    if (wantsAccess) {
        return <LoginPanel onClickBack={() => {setWantsAccess(false)}}>
            {showRequestCreated && <AcceptButtonPanel
                onClose={() => {setShowRequestCreated(false); setWantsAccess(false)}}
                open={showRequestCreated}
            >
                <div className={"text-[var(--text-light)] sm:text-lg p-5 max-w-[360px] text-center"}>
                    ¡Listo! Ni bien podamos te enviamos la invitación. Gracias por tu interés.
                </div>
            </AcceptButtonPanel>}
            <h2 className={"font-extrabold"}>Solicitar acceso</h2>
            <div className={"flex flex-col items-center space-y-8 pb-12"}>
                <div className={"text-[var(--text-light)] text-center sm:text-lg max-w-[380px]"}>
                    Estamos enviando invitaciones por orden de llegada a medida que hacemos espacio para más
                    gente.
                </div>
                <TextField
                    fullWidth
                    label={"Mail de contacto"}
                    value={email}
                    size={"small"}
                    placeholder={""}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                    fullWidth
                    label={"Comentario opcional"}
                    multiline
                    minRows={3}
                    value={comment}
                    size={"small"}
                    placeholder={"Por si querés escribir algo (sobornos o amenazas, por ejemplo)."}
                    onChange={(e) => setComment(e.target.value)}
                />
                <div className={"flex justify-end w-full"}>
                    <StateButton
                        handleClick={onSendAccessRequest}
                        textClassName={"font-bold text-sm"}
                        size={"large"}
                        color={"background-dark3"}
                        text1={"Enviar"}
                        disabled={!/^.+@.+$/.test(email)}
                    />
                </div>
            </div>
        </LoginPanel>
    }

    return <LoginPanel>
        <div className="mb-2 mt-4 space-y-4">
            <Logo width={60} height={60}/>
            <h1 className={"text-2xl font-extrabold"}>Iniciar sesión</h1>
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
                    ¿No tenés una cuenta? <Link className="link2" target="_blank" href="https://bsky.app">Registrate en
                    Bluesky</Link>.
                </div>

                {!inviteCode && <div className={"pt-4 w-full"}>
                    <Button color="background-dark2" size={"large"} fullWidth={true} onClick={() => {
                        setWantsAccess(true)
                    }}>
                        <span className={"font-bold text-[13px]"}>Solicitar acceso al período de prueba</span>
                    </Button>
                </div>}

                <div className={"pt-0"} onClick={() => {
                    router.push("/presentacion" + (inviteCode ? `?c=${inviteCode}` : ""))
                }}>
                    <Button color={"background"}>
                        <span className={"text-[var(--text-light)] text-[14px]"}>Conocer más</span>
                    </Button>
                </div>
            </div>
        </div>
    </LoginPanel>
}