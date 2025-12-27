import Link from "next/link"
import {BlueskyLogin} from "./bluesky-login"
import {useRouter, useSearchParams} from "next/navigation";
import {ReactNode, useState} from "react";
import {BaseTextField} from "@/components/utils/base/base-text-field";
import {useLoginModal} from "./login-modal-provider";
import {BaseFullscreenPopup} from "@/components/utils/dialogs/base-fullscreen-popup";
import {BackButton} from "@/components/utils/base/back-button";
import {CloseButton} from "@/components/utils/base/close-button";
import {post} from "@/components/utils/react/fetch";
import {AcceptButtonPanel} from "@/components/utils/dialogs/accept-button-panel";
import {Note} from "@/components/utils/base/note";
import {BaseTextArea} from "@/components/utils/base/base-text-area";
import {StateButton} from "@/components/utils/base/state-button";
import {Logo} from "@/components/utils/icons/logo";
import {BaseButton} from "@/components/utils/base/base-button";
import {topicUrl} from "@/components/utils/react/url";


const LoginPanel = ({children, onClickBack, onClose}: {
    children: ReactNode
    onClickBack?: () => void
    onClose?: () => void
}) => {
    return <BaseFullscreenPopup
        open={true}
        closeButton={false}
        backgroundShadow={true}
        className={"top-0 h-screen translate-y-0 sm:h-auto"}
    >
        <div
            className={"sm:w-[480px] px-4 space-y-16 sm:space-y-0 sm:h-auto flex flex-col items-center w-screen h-screen"}
        >
            <div
                className={"flex w-full text-[var(--text-light)] mt-4 " + (onClickBack ? "justify-between" : "justify-end")}>
                {onClickBack && <BackButton
                    onClick={onClickBack}
                />}
                {onClose != null && <CloseButton
                    onClose={onClose}
                />}
            </div>
            {children}
        </div>
    </BaseFullscreenPopup>
}


export const LoginModal = ({
                               open,
                               onClose
                           }: {
    open: boolean;
    onClose?: () => void;
}) => {
    const params = useSearchParams()
    const inviteCode = params.get("c")
    const router = useRouter()
    const [wantsAccess, setWantsAccess] = useState<boolean>(false)
    const [email, setEmail] = useState<string>("")
    const [comment, setComment] = useState<string>("")
    const [showRequestCreated, setShowRequestCreated] = useState<boolean>(false)
    const [showWhyBsky, setShowWhyBsky] = useState(false)
    const {setLoginModalOpen} = useLoginModal()

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

    if (!open) {
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
                <div
                    className="text-[var(--text-light)] font-light p-5 max-w-[360px] text-center">
                    ¡Listo! Ni bien podamos te enviamos la invitación. Gracias por tu interés.
                </div>
            </AcceptButtonPanel>}
            <h2 className={"font-bold uppercase text-lg pb-2"}>Solicitar acceso</h2>
            <div className={"flex flex-col items-center space-y-4 pb-12"}>
                <Note maxWidth={380}>
                    Estamos enviando invitaciones al período de prueba por orden de llegada a medida que hacemos espacio
                    para más
                    gente.
                </Note>
                <BaseTextField
                    label={"Correo de contacto"}
                    value={email}
                    placeholder={""}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <BaseTextArea
                    label={"Comentario opcional"}
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
                <div className={"flex justify-end w-full"}>
                    <StateButton
                        handleClick={onSendAccessRequest}
                        variant={"outlined"}
                        disabled={!/^.+@.+$/.test(email)}
                    >
                        Enviar
                    </StateButton>
                </div>
                <Note text={"text-xs"}>
                    Ante cualquier duda podés escribirnos a soporte@cabildoabierto.ar.
                </Note>
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
                        className={"flex flex-col space-y-4 items-center max-w-80 text-center"}>
                        <div className={"text-base"}>
                            ¡Recibiste un código de invitación!
                        </div>
                        <Note text={"text-sm"}>
                            Si ya tenés una cuenta de Bluesky, iniciá sesión directamente. Si no, <Link
                            className={"link2"} target={"_blank"} href={"https://bsky.app"}>creala primero acá</Link> y
                            después volvé a esta página.
                        </Note>
                    </div>}

                    <div className={"max-w-[360px]"}>
                        <BlueskyLogin
                            inviteCode={inviteCode ?? undefined}
                            onLogin={() => {
                                setLoginModalOpen(false)
                            }}
                        />

                        {!inviteCode && <div className={"pt-4 w-full"}>
                            <BaseButton
                                variant={"outlined"}
                                className={"w-full"}
                                onClick={() => {
                                    setWantsAccess(true)
                                }}
                            >
                                Participar en el período de prueba
                            </BaseButton>
                        </div>}
                    </div>

                    <div className={"font-extralight pt-2 flex flex-col space-y-4 pb-2 items-center text-center"}>
                        <Note text={"text-sm"}>
                            <Link
                                href={"/apps/web/public"}
                                target={"_blank"}
                                onClick={(e) => {
                                    e.preventDefault()
                                    router.push(inviteCode ? `/?c=${inviteCode}` : "/")
                                }}
                            >
                                Conocer más sobre Cabildo Abierto
                            </Link>
                        </Note>
                        <Note
                            text={"text-xs"}
                        >
                            Al iniciar sesión aceptás los <Link
                            target="_blank"
                            className="hover:underline hover:text-[var(--text)]"
                            href={topicUrl("Cabildo Abierto: Términos y condiciones")}
                        >
                            Términos y condiciones</Link> y la <Link
                            target="_blank"
                            className="hover:underline hover:text-[var(--text)]"
                            href={topicUrl("Cabildo Abierto: Política de privacidad")}>
                            Política
                            de privacidad</Link>, ¡leelos!.
                        </Note>
                    </div>
                </div>
            </div>
        </div>
    </LoginPanel>
}