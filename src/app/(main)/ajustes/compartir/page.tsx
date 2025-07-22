"use client"
import {PageCardMessage} from "@/components/aportar/page-card-message";
import {useInviteCodesToShare} from "@/queries/api";
import {useState} from "react";
import {CheckIcon} from "@phosphor-icons/react";
import {AcceptButtonPanel} from "../../../../../modules/ui-utils/src/accept-button-panel";
import LoadingSpinner from "../../../../../modules/ui-utils/src/loading-spinner";


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

export default function Page() {
    const {data, isLoading} = useInviteCodesToShare()
    const [copied, setCopied] = useState<boolean>(false)

    if(isLoading){
        return <div className={"pt-16"}>
            <LoadingSpinner/>
        </div>
    }

    const content = <div className={"space-y-2"}>
        <div className={"pb-2"}>
            Apretá en un enlace para copiarlo y enviárselo a alguien. Vamos a ir disponibilizando más enlaces a medida que la plataforma esté lista.
        </div>
        {data && data.map(c => {
            return <div key={c.code}>
                <div
                    onClick={async () => {
                        await copyCode(c.code);
                        setCopied(true)
                    }}
                    className={"bg-[var(--background-dark)] hover:bg-[var(--background-dark2)] flex items-center justify-between cursor-pointer rounded py-1 px-2"}
                >
                    <div className={"w-3/4"}>
                        {inviteCodeUrl(c.code)}
                    </div>
                </div>
            </div>
        })}
    </div>
    return <div>
        <PageCardMessage
            title={`Tenés ${data.length} enlaces de invitación disponibles.`}
            content={content}
        />
        {copied && <AcceptButtonPanel open={copied} onClose={() => setCopied(false)}>
            <div className={"flex flex-col items-center space-y-4 py-4"}>
                <div className={"w-16 h-16 rounded-full bg-[var(--background-dark2)] flex items-center justify-center"}>
                    <CheckIcon fontSize={30} weight={"bold"}/>
                </div>
                <div className={"text-lg"}>
                    ¡Invitación copiada!
                </div>
            </div>
        </AcceptButtonPanel>}
    </div>
}