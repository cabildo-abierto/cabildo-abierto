"use client"
import Link from "next/link"
import {BlueskyLogin} from "./bsky-login"
import {Logo} from "../utils/logo"
import {useRouter, useSearchParams} from "next/navigation";
import {Button} from "../utils/button";
import {ReactNode, useState} from "react";
import {TextField} from "../utils/text-field";
import {post} from "@/utils/fetch";
import StateButton from "../utils/state-button";
import {AcceptButtonPanel} from "../utils/accept-button-panel";
import {topicUrl} from "@/utils/uri";
import {BaseFullscreenPopup} from "../utils/base-fullscreen-popup";
import {BackButton} from "../utils/back-button";
import {CloseButton} from "../utils/close-button";


const LoginPanel = ({children, onClickBack, onClose}: {
    children: ReactNode
    onClickBack?: () => void
    onClose: () => void
}) => {
    return <BaseFullscreenPopup open={true} closeButton={false}>
        <div
            className={"sm:w-[480px] px-4 space-y-16 sm:space-y-0 sm:h-auto flex flex-col items-center w-screen h-screen"}
        >
            <div className={"flex w-full text-[var(--text-light)] mt-4 " + (onClickBack ? "justify-between" : "justify-end")}>
                {onClickBack && <BackButton
                    color={"background"}
                    onClick={onClickBack}
                    size={"small"}
                />}
                <CloseButton onClose={onClose} size={"small"}/>
            </div>
            {children}
        </div>
    </BaseFullscreenPopup>
}


const LoginModal = ({
                        open,
                        onClose
                    }: {
    open: boolean;
    onClose: () => void;
}) => {
    const params = useSearchParams()
    const inviteCode = params.get("c")
    const router = useRouter()
    const [wantsAccess, setWantsAccess] = useState<boolean>(false)
    const [email, setEmail] = useState<string>("")
    const [comment, setComment] = useState<string>("")
    const [showRequestCreated, setShowRequestCreated] = useState<boolean>(false)
    const [showWhyBsky, setShowWhyBsky] = useState(false)

    async function onSendAccessRequest() {
        const {error} = await post<{}, {}>("/access-request", {email, comment})
        if (error) {
            return {error}
        } else {
            setShowRequestCreated(true)
            setComment("")
            setEmail("")
            return {}
        }
    }

    if(!open) {
        return null
    }

    if (wantsAccess) {
        return <LoginPanel
            onClose={onClose}
            onClickBack={() => {
            setWantsAccess(false)
        }}>
            {showRequestCreated && <AcceptButtonPanel
                onClose={() => {
                    setShowRequestCreated(false);
                    setWantsAccess(false)
                }}
                open={showRequestCreated}
            >
                <div className={"text-[var(--text-light)] sm:text-lg p-5 max-w-[360px] text-center"}>
                    ¡Listo! Ni bien podamos te enviamos la invitación. Gracias por tu interés.
                </div>
            </AcceptButtonPanel>}
            <h2 className={"font-bold uppercase text-lg pb-2"}>Solicitar acceso</h2>
            <div className={"flex flex-col items-center space-y-8 pb-12"}>
                <div className={"text-[var(--text-light)] font-extralight text-center max-w-[380px]"}>
                    Estamos enviando invitaciones al período de prueba por orden de llegada a medida que hacemos espacio
                    para más
                    gente.
                </div>
                <TextField
                    fullWidth
                    label={"Mail de contacto"}
                    value={email}
                    paddingX={"0"}
                    size={"small"}
                    placeholder={""}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                    fullWidth
                    label={"Comentario opcional"}
                    multiline
                    minRows={3}
                    paddingX={"12px"}
                    value={comment}
                    size={"small"}
                    placeholder={"Sobornos o amenazas, por ejemplo."}
                    onChange={(e) => setComment(e.target.value)}
                />
                <div className={"flex justify-end w-full"}>
                    <StateButton
                        handleClick={onSendAccessRequest}
                        textClassName={"font-semibold text-sm"}
                        size={"large"}
                        variant={"outlined"}
                        text1={"Enviar"}
                        disabled={!/^.+@.+$/.test(email)}
                    />
                </div>
                <div className={"text-xs text-[var(--text-light)] text-center font-extralight"}>
                    Ante cualquier duda podés escribirnos a soporte@cabildoabierto.ar.
                </div>
            </div>
        </LoginPanel>
    }

    if (showWhyBsky) {
        return <LoginPanel
            onClose={onClose}
            onClickBack={() => {
            setShowWhyBsky(false)
        }}>
            <h2 className={"font-extrabold"}>¿Por qué el registro es en Bluesky?</h2>
            <div className={"flex flex-col items-center space-y-2 pb-12 text-justify p-4 text-[var(--text-light)]"}>
                <p>
                    Bluesky y Cabildo Abierto se basan en un mismo {'"protocolo de redes sociales descentralizadas"'},
                    que se
                    llama ATProtocol. Esto significa fundamentalmente que las cuentas y algunos contenidos son
                    compartidos entre las dos plataformas,
                    y cualquier otra plataforma que use el mismo protocolo.
                </p>
                <p>
                    Cuando te registrás en Bluesky, te estás creando una cuenta en este protocolo, que te sirve para
                    cualquier plataforma que lo use.

                    Eventualmente vamos a agregar la posibilidad de registrarte directamente en Cabildo Abierto, pero
                    por ahora, te pedimos que vayas a Bluesky.
                </p>
                <p>
                    Podés encontrar más información sobre ATProtocol en su <Link target={"_blank"}
                                                                                 className="text-[var(--primary)] hover:underline"
                                                                                 href={"https://atproto.com/"}>página
                    oficial</Link>.
                </p>
            </div>
        </LoginPanel>
    }

    return <LoginPanel
        onClose={onClose}
    >
        <div className={"space-y-4 flex flex-col items-center pt-4"}>
            <div className="space-y-4 flex flex-col items-center">
                <Logo width={64} height={64}/>
                <h1 className={"text-lg font-bold uppercase"}>Iniciar sesión</h1>
            </div>

            <div className="flex justify-center sm:px-8">
                <div className="w-full flex flex-col items-center space-y-4 px-2 mb-4">
                    {inviteCode && <div
                        className={"font-light flex flex-col space-y-4 items-center max-w-80 text-center"}>
                        <div className={"text-lg"}>
                            ¡Recibiste un código de invitación!
                        </div>
                        <div className={"text-sm text-[var(--text-light)]"}>
                            Si ya tenés una cuenta de Bluesky, iniciá sesión directamente. Si no, <Link
                            className={"link2"} target={"_blank"} href={"https://bsky.app"}>creala primero acá</Link> y
                            después volvé a esta página.
                        </div>
                    </div>}

                    <div className={"max-w-[360px]"}>
                        <BlueskyLogin inviteCode={inviteCode}/>

                        {!inviteCode && <div className={"pt-4 w-full"}>
                            <Button
                                size={"medium"}
                                variant={"outlined"}
                                fullWidth={true}
                                onClick={() => {
                                    setWantsAccess(true)
                                }}>
                                <span className={"text-[13px] uppercase"}>Participar en el período de prueba</span>
                            </Button>
                        </div>}
                    </div>

                    <div className={"font-extralight pt-2 flex flex-col space-y-4 pb-2 items-center text-center"}>
                        <Link
                            href={"/public"}
                            target={"_blank"}
                            onClick={(e) => {
                                e.preventDefault()
                                router.push(inviteCode ? `/?c=${inviteCode}` : "/")
                            }}
                            className={"text-[var(--text-light)] hover:text-[var(--text)] text-[14px]"}
                        >
                            Conocer más sobre Cabildo Abierto
                        </Link>
                        <span
                            className={"text-[var(--text-light)] text-[14px] text-xs"}
                        >
                        Al iniciar sesión aceptás los <Link target="_blank"
                                                            className="hover:underline hover:text-[var(--text)]"
                                                            href={topicUrl("Cabildo Abierto: Términos y condiciones", undefined, "normal")}>
                        Términos y condiciones</Link> y <Link target="_blank"
                                                              className="hover:underline hover:text-[var(--text)]"
                                                              href={topicUrl("Cabildo Abierto: Política de privacidad", undefined, "normal")}>Política de privacidad</Link>, ¡leelos!.
                    </span>
                    </div>
                </div>
            </div>
        </div>
    </LoginPanel>
}


export default LoginModal