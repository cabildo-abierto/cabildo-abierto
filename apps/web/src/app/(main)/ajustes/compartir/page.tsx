"use client"
import {PageCardMessage} from "@/components/aportar/page-card-message";
import {
    CopyIcon,
    WhatsappLogoIcon
} from "@phosphor-icons/react";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {useAPI} from "@/components/utils/react/queries";
import {toast} from "sonner";
import {BaseIconButton} from "@/components/utils/base/base-icon-button";

function shareText(code: string) {
    return encodeURIComponent(
        "Sumate a Cabildo Abierto, una plataforma de discusión argentina."
    )
}

function shareUrl(code: string) {
    return encodeURIComponent(inviteCodeUrl(code))
}

function openShare(url: string) {
    window.open(url, "_blank", "noopener,noreferrer")
}

function shareOnWpp(code: string) {
    openShare(
        `https://wa.me/?text=${shareText(code)}%20${shareUrl(code)}`
    )
}


function inviteCodeUrl(code: string) {
    return `https://www.cabildoabierto.ar/login?c=${code}`
}

async function copyCode(c: string) {
    const url = inviteCodeUrl(c)

    if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
    } else {
        console.warn("Clipboard API not available")
    }
}


type InviteCode = {
    code: string
}

function useInviteCodesToShare() {
    return useAPI<InviteCode[]>("/invite-codes-to-share", ["invite-codes-to-share"])
}

export default function Page() {
    const {data, isLoading} = useInviteCodesToShare()

    if(isLoading){
        return <div className={"pt-16"}>
            <LoadingSpinner/>
        </div>
    }

    const content = <div className={"space-y-2"}>
        <h2 className={"text-lg"}>
            Cuantos más, mejor
        </h2>
        <div className={"pb-2 font-light text-[var(--text)]"}>
            Cada enlace de invitación permite registrar una cuenta. ¡Compartilos!
        </div>
        {data && data.map(c => {
            return <div key={c.code}>
                <div
                    className={"space-x-2 bg-[var(--background-dark)] flex items-center justify-between border py-1 px-2"}
                >
                    <div className={"font-light text-sm"}>
                        {inviteCodeUrl(c.code)}
                    </div>
                    <div className={"flex justify-center items-center space-x-1"}>
                        <BaseIconButton
                            onClick={() => {shareOnWpp(c.code)}}
                        >
                            <WhatsappLogoIcon/>
                        </BaseIconButton>
                        <BaseIconButton
                            onClick={async () => {
                                await copyCode(c.code)
                                toast.message("¡Enlace copiado!")
                            }}
                        >
                        <CopyIcon/>
                        </BaseIconButton>
                    </div>
                </div>
            </div>
        })}
        <div className={"text-sm text-[var(--text-light)]"}>
            Si te quedás sin enlaces para compartir, cada tanto agregamos más, podés avisarnos escribiendo a @cabildoabierto.ar.
        </div>
    </div>
    return <div>
        <PageCardMessage
            content={content}
        />
    </div>
}