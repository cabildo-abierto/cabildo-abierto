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
import {topicUrl} from "@/utils/uri";


const LoginPanel = ({children, onClickBack}: { children: ReactNode, onClickBack?: () => void }) => {
    return <div className="flex flex-col items-center justify-center w-screen h-screen bg-[var(--background-dark)]">
        <div
            className={"bg-[var(--background)] sm:w-[480px] border border-[var(--text)] px-4 space-y-16 sm:space-y-0 sm:h-auto flex flex-col items-center w-screen h-screen"}
        >
            <div className={"flex justify-start w-full text-[var(--text-light)] mt-4"}>
                <BackButton
                    defaultURL={"/"}
                    preferReferrer={false}
                    color={"background"}
                    onClick={onClickBack}
                />
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

    if (wantsAccess) {
        return <LoginPanel onClickBack={() => {
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
            <h2 className={"font-extrabold"}>Solicitar acceso</h2>
            <div className={"flex flex-col items-center space-y-8 pb-12"}>
                <div className={"text-[var(--text-light)] font-extralight text-center max-w-[380px]"}>
                    Estamos enviando invitaciones al período de prueba por orden de llegada a medida que hacemos espacio para más
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
                <div className={"text-xs text-[var(--text-light)] text-center font-extralight"}>
                    Ante cualquier duda podés escribirnos a soporte@cabildoabierto.ar.
                </div>
            </div>
        </LoginPanel>
    }

    if(showWhyBsky){
        return <LoginPanel onClickBack={() => {
            setShowWhyBsky(false)
        }}>
            <h2 className={"font-extrabold"}>¿Por qué el registro es en Bluesky?</h2>
            <div className={"flex flex-col items-center space-y-2 pb-12 text-justify p-4 text-[var(--text-light)]"}>
                <p>
                    Bluesky y Cabildo Abierto se basan en un mismo {'"protocolo de redes sociales descentralizadas"'}, que se
                llama ATProtocol. Esto significa fundamentalmente que las cuentas y algunos contenidos son compartidos entre las dos plataformas,
                    y cualquier otra plataforma que use el mismo protocolo.
                </p>
                <p>
                    Cuando te registrás en Bluesky, te estás creando una cuenta en este protocolo, que te sirve para cualquier plataforma que lo use.

                    Eventualmente vamos a agregar la posibilidad de registrarte directamente en Cabildo Abierto, pero por ahora, te pedimos que vayas a Bluesky.
                </p>
                <p>
                    Podés encontrar más información sobre ATProtocol en su <Link target={"_blank"} className="text-[var(--primary)] hover:underline" href={"https://atproto.com/"}>página oficial</Link>.
                </p>
            </div>
        </LoginPanel>
    }

    return <LoginPanel>
        <div className={"space-y-4 flex flex-col items-center"}>
        <div className="mb-2 space-y-4">
            <Logo width={60} height={60}/>
            <h1 className={"text-2xl font-normal uppercase"}>Iniciar sesión</h1>
        </div>

        <div className="flex justify-center sm:px-8">
            <div className="w-full flex flex-col items-center space-y-4 px-2 mb-4">
                {inviteCode && <div
                    className={"font-light flex flex-col space-y-4 items-center bg-[var(--background-dark2)] max-w-80 text-center rounded-lg p-4"}>
                    <div className={"text-[var(--text-light)] text-lg"}>
                        <LuPartyPopper fontSize={"22px"}/>
                    </div>
                    <div className={"text-lg"}>
                        ¡Recibiste un código de invitación!
                    </div>
                    <div className={"text-sm text-[var(--text-light)]"}>
                        Si ya tenés una cuenta de Bluesky, iniciá sesión. Si no, <Link
                        className={"link2"} target={"_blank"} href={"https://bsky.app"}>creala primero acá</Link> y después volvé a esta página.
                    </div>
                </div>}

                <div className={"max-w-[360px]"}>
                    <BlueskyLogin inviteCode={inviteCode}/>

                    {!inviteCode && <div className={"pt-4 w-full"}>
                        <Button
                            color="background-dark"
                            size={"large"}
                            borderColor={"text-lighter"}
                            sx={{
                                border: "1px solid"
                            }}
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
                        href={"/"}
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
                        Al iniciar sesión aceptás los <Link target="_blank" className="hover:underline hover:text-[var(--text)]" href={topicUrl("Cabildo Abierto: Términos y condiciones", undefined, "normal")}>
                        Términos y condiciones</Link> y <Link target="_blank" className="hover:underline hover:text-[var(--text)]" href={topicUrl("Cabildo Abierto: Política de privacidad", undefined, "normal")}>Política de privacidad</Link>, ¡leelos!.
                    </span>
                </div>
            </div>
        </div>
        </div>
    </LoginPanel>
}