"use client"
import {BaseButton} from "../layout/base/baseButton";
import {useLoginModal} from "@/components/layout/login-modal-provider";
import {useSession} from "@/queries/getters/useSession";
import {useRouter, useSearchParams} from "next/navigation";
import {useMediaQuery} from "usehooks-ts";


export const GoToLoginButton = ({
                                    fontSize = 13,
                                    className = "font-semibold",
                                    text = "Crear una cuenta o iniciar sesión"
                                }: {
    className?: string
    fontSize?: number
    text?: string
}) => {
    const {setLoginModalOpen} = useLoginModal()
    const {user} = useSession()
    const router = useRouter()
    const isMobile = useMediaQuery('(max-width:900px)')
    const params = useSearchParams()

    const code = params.get("c")

    return <BaseButton
        variant={"outlined"}
        size={!isMobile ? "large" : "default"}
        onClick={() => {
            if (user) {
                router.push("/inicio")
            } else {
                setLoginModalOpen(true)
            }
        }}
        letterSpacing={"0em"}
    >
        <div className={"flex flex-col"}>
            {code && <div
                className={"text-[11px] flex items-center space-x-2 justify-center"}
                style={{
                    textTransform: "none",
                    letterSpacing: "0em",
                }}
            >
                <span>¡Recibiste un código de invitación!</span>
            </div>}
            <div className={className} style={{fontSize}}>{text}</div>
        </div>
    </BaseButton>
}

