import Link from "next/link"
import {BlueskyLogin} from "./bluesky-login"
import {usePathname, useRouter, useSearchParams} from "next/navigation";
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


const LoginPanel = ({children, onClickBack, onClose, open}: {
    children: ReactNode
    onClickBack?: () => void
    onClose?: () => void
    open: boolean
}) => {
    return <BaseFullscreenPopup
        open={open}
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


const LoginModalAccessRequest = ({onBack}: {
    onBack: () => void,
}) => {
    const [email, setEmail] = useState<string>("")
    const [comment, setComment] = useState<string>("")
    const [showRequestCreated, setShowRequestCreated] = useState<boolean>(false)

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

    return <div>
        <AcceptButtonPanel
            onClose={() => {
                setShowRequestCreated(false);
                onBack()
            }}
            open={showRequestCreated}
        >
            <div
                className="text-[var(--text-light)] font-light p-5 max-w-[360px] text-center">
                ¡Listo! Ni bien podamos te enviamos la invitación. Gracias por tu interés.
            </div>
        </AcceptButtonPanel>
        <h2 className={"font-bold text-lg pb-2 text-center"}>Solicitar acceso</h2>
        <div className={"flex flex-col items-center space-y-4 pb-12"}>
            <Note maxWidth={380} className={"text-left"}>
                Estamos enviando invitaciones al acceso anticipado por orden de llegada a medida que hacemos espacio
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
    </div>
}



export const LoginModal = ({
                               open,
                               onClose,
    accessRequest,
    setAccessRequest
                           }: {
    open: boolean;
    onClose?: () => void;
    accessRequest: boolean
    setAccessRequest: (v: boolean) => void
}) => {
    const params = useSearchParams()
    const inviteCode = params.get("c")
    const router = useRouter()
    const {setLoginModalOpen} = useLoginModal()
    const pathname = usePathname()

    return <LoginPanel
        open={open}
        onClose={onClose}
        onClickBack={accessRequest ? () => {
            setAccessRequest(false)
        } : undefined}
    >
        {accessRequest && <LoginModalAccessRequest
            onBack={() => {setAccessRequest(false)}}
        />}
        {!accessRequest && <div className={"space-y-4 flex flex-col items-center pt-4"}>
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
                                    setAccessRequest(true)
                                }}
                            >
                                Participar en el acceso anticipado
                            </BaseButton>
                        </div>}
                    </div>

                    <div className={"font-extralight pt-2 flex flex-col space-y-4 pb-2 items-center text-center"}>
                        {!pathname.startsWith("/presentacion") && <Note text={"text-sm"}>
                            <Link
                                href={"/presentacion"}
                                target={"_blank"}
                                onClick={(e) => {
                                    e.preventDefault()
                                    router.push(inviteCode ? `/presentacion?c=${inviteCode}` : "/presentacion")
                                }}
                            >
                                Conocer más sobre Cabildo Abierto
                            </Link>
                        </Note>}
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
        </div>}
    </LoginPanel>
}