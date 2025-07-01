"use client"
import {chatUrl, profileUrl, topicUrl} from "@/utils/uri";

import Link from "next/link"
import {post} from "@/utils/fetch";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {PageCardMessage} from "@/components/aportar/page-card-message";
import {useState} from "react";
import {useConversations} from "@/queries/api";

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
            const {data, error} = await post<{}, {convoId: string}>(`/conversation/create/${cabildoDid}`)
            if(data){
                console.log("got data", data)
                router.push(chatUrl(data.convoId))
            } else {
                setStartingConv(false)
            }
        }

    }

    if(startingConv){
        return <LoadingSpinner/>
    }

    const content = (
        <div className={"mt-3"}>
            Por cualquier consulta, problema o sugerencia podés:
            <ul className={"ml-6 mt-3"}>
                <li>Escribirnos por mensaje privado a <Link
                    href={profileUrl("cabildoabierto.ar")}
                >
                    @cabildoabierto
                </Link> (hacé click <button className={"hover:underline text-[var(--primary)]"} onClick={startConversation}>acá</button> para empezar una conversación).
                </li>
                <li>
                    Mencionar a <Link
                    href={profileUrl("cabildoabierto.ar")}
                >
                    @cabildoabierto
                </Link> en un post.
                </li>
                <li>
                    Escribirnos por mail a <Link href={"mailto:soporte@cabildoabierto.ar"}>soporte@cabildoabierto.ar</Link>.
                </li>
                <li>
                    Comentar los <Link
                    href={topicUrl("Cabildo Abierto")}
                >
                    temas de Cabildo Abierto
                </Link>.
                </li>
            </ul>
        </div>
    )

    return <PageCardMessage
        title={"Vías de contacto"}
        content={content}
    />
}

export default Page