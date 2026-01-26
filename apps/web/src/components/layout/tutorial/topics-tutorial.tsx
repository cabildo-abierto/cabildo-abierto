"use client"

import React, {ReactNode, useEffect, useState} from "react";
import {useSearchParams} from "next/navigation";
import {useSession} from "@/components/auth/use-session";
import {post} from "../../utils/react/fetch";
import {useQueryClient} from "@tanstack/react-query";
import {produce} from "immer";
import {useTopics} from "@/queries/getters/useTopics";
import {AcceptButtonPanel} from "../../utils/dialogs/accept-button-panel";
import { Session } from "@cabildo-abierto/api";


const RunTutorial = ({children}: { children: ReactNode }) => {
    const [runStatus, setRunStatus] = useState<"not started" | "running" | "finished">("not started")
    const qc = useQueryClient()
    const {data: topics} = useTopics([], "popular", "week")

    useEffect(() => {
        if(topics){
            setRunStatus("running")
        }
    }, [topics]);

    async function setSeenTutorial() {
        qc.setQueryData(["session"], old => {
            return produce(old as Session, draft => {
                draft.seenTutorial.topics = true
            })
        })
        await post("/seen-tutorial/topics")
    }

    useEffect(() => {
        if (runStatus == "finished") {
            setSeenTutorial()
        }
    }, [runStatus])

    return (
        <>
            <AcceptButtonPanel
                onClose={() => {setRunStatus("finished")}}
                open={runStatus == "running"}
                className={"max-w-[400px] font-light space-y-2 sm:text-base text-sm"}
            >
                <p>
                    Por cada tema de discusión en Cabildo Abierto en el que se reúne información. Llamamos a estos artículos {'"temas"'} y cualquiera puede editarlos.
                </p>
                <p>
                    Además, cada tema tiene una sección de discusión y un muro en el que se muestran las menciones que recibió.
                </p>
                <p>
                    Hacé click en un tema para ver su contenido.
                </p>
            </AcceptButtonPanel>
            {children}
        </>
    )
}


const TopicsPageTutorial = ({children}: {children: ReactNode}) => {
    const params = useSearchParams()
    let {user} = useSession()

    if (user && (params.get("tutorial") || !user.seenTutorial.topics)){
        return (
            <RunTutorial>
                {children}
            </RunTutorial>
        )
    } else {
        return children
    }
}


export default TopicsPageTutorial