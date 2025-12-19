"use client"
import {BaseButton} from "@/components/utils/base/base-button";
import {useLoginModal} from "../auth/login-modal-provider";
import {useSession} from "@/components/auth/use-session";
import {useRouter, useSearchParams} from "next/navigation";
import {useMediaQuery} from "usehooks-ts";
import {cn} from "@/lib/utils";
import {SignInIcon} from "@phosphor-icons/react";


export const GoToLoginButton = ({
                                    className,
                                    textClassName = "font-semibold",
                                    text = "Crear una cuenta o iniciar sesión",
    inviteClassName
                                }: {
    textClassName?: string
    className?: string
    inviteClassName?: string
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
        className={className}
        startIcon={<SignInIcon/>}
    >
        <div className={"flex flex-col items-center"}>
            <div
                className={cn("text-[13px] whitespace-break-spaces", textClassName)}
            >
                {code ? "¡Recibiste un código de invitación!" : text}
            </div>
        </div>
    </BaseButton>
}

