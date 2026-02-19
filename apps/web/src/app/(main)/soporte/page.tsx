"use client"

import Link from "next/link"
import {post} from "@/components/utils/react/fetch";
import { useRouter } from "next/navigation";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {useState} from "react";
import {useConversations} from "@/queries/getters/useConversations";
import {categoryUrl, chatUrl, profileUrl} from "@/components/utils/react/url";

const cabildoDid = "did:plc:2semihha42b7efhu4ywv7whi"

const Page = () => {
    const router = useRouter()
    const [startingConv, setStartingConv] = useState<boolean>(false)
    const {data: conversations} = useConversations()

    async function startConversation() {
        setStartingConv(true)
        if(conversations){
            const idx = conversations.findIndex(c => c.members.some(m => m.did == cabildoDid))
            if(idx != -1) {
                router.push(chatUrl(conversations[idx].id))
            }
        } else {
            const res = await post<{}, {convoId: string}>(`/conversation/create/${cabildoDid}`)
            if(res.success === true){
                router.push(chatUrl(res.value.convoId))
            } else {
                setStartingConv(false)
                return {error: res.error}
            }
        }

    }

    if(startingConv){
        return <LoadingSpinner/>
    }


    return <div className={"font-light p-6"}>
        Por cualquier consulta, problema o sugerencia podés:
        <ul className={"ml-6 mt-3"}>
            <li>Escribirnos por mensaje privado a <Link
                href={profileUrl("cabildoabierto.ar")}
            >
                    <span className={"text-[var(--text)]"}>
                        @cabildoabierto
                    </span>
            </Link> (hacé click <button className={"hover:underline text-[var(--text)]"} onClick={startConversation}>acá</button> para empezar una conversación).
            </li>
            <li>
                Mencionar a <Link
                href={profileUrl("cabildoabierto.ar")}
            >
                    <span className={"text-[var(--text)]"}>
                        @cabildoabierto
                    </span>
            </Link> en una publicación.
            </li>
            <li>
                Escribirnos por mail a <Link href={"mailto:soporte@cabildoabierto.ar"}>
                    <span className={"text-[var(--text)]"}>
                        soporte@cabildoabierto.ar
                    </span>
            </Link>.
            </li>
            <li>
                Comentar los <Link
                href={categoryUrl("Cabildo Abierto", "lista")}
            >
                    <span className={"text-[var(--text)]"}>
                        temas de Cabildo Abierto
                    </span>
            </Link>.
            </li>
        </ul>
    </div>
}

export default Page