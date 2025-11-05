"use client"
import {BaseButton} from "../layout/base/baseButton";
import {useLoginModal} from "@/components/layout/login-modal-provider";
import {useSession} from "@/queries/getters/useSession";
import {useRouter, useSearchParams} from "next/navigation";
import {useMediaQuery} from "usehooks-ts";
import {cn} from "@/lib/utils";


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
    >
        <div className={"flex flex-col items-center"}>
            {code && <div
                className={cn("text-[11px] text-[var(--text-light)] flex items-center space-x-2 justify-center  whitespace-break-spaces normal-case", inviteClassName)}
            >
                <span>¡Recibiste un código de invitación!</span>
            </div>}
            <div
                className={cn("text-[13px] whitespace-break-spaces", textClassName)}
            >
                {text}
            </div>
        </div>
    </BaseButton>
}

