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
    inviteClassName,
    variant
                                }: {
    textClassName?: string
    className?: string
    inviteClassName?: string
    text?: string
    variant: "outlined" | "black" | "white" | "default"
}) => {
    const {setLoginModalOpen} = useLoginModal()
    const {user} = useSession()
    const router = useRouter()
    const isMobile = useMediaQuery('(max-width:900px)')
    const params = useSearchParams()

    const code = params.get("c")

    return <BaseButton
        size={!isMobile ? "default" : "default"}
        onClick={() => {
            if (user) {
                router.push("/inicio")
            } else {
                setLoginModalOpen(true)
            }
        }}
        variant={variant}
        letterSpacing={"0em"}
        className={cn(className, "max-w-80")}
        startIcon={<SignInIcon/>}
    >
        <div className={"flex flex-col items-center"}>
            {code ? <div
                className={cn("text-[11px] sm:max-w-none sm:text-[12px] whitespace-nowrap")}
            >
                ¡Recibiste un código de invitación!
            </div> : <div
                className={cn("text-[13px] whitespace-break-spaces", textClassName)}
            >
                {text}
            </div>}
        </div>
    </BaseButton>
}

