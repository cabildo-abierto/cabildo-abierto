"use client"

import React, {ReactNode, useEffect, useState} from "react";
import {useSearchParams} from "next/navigation";
import {AcceptButtonPanel} from "../../utils/dialogs/accept-button-panel";
import {useSession} from "@/components/auth/use-session";
import {useQueryClient} from "@tanstack/react-query";
import {produce} from "immer";
import {useLayoutConfig} from "../main-layout/layout-config-context";
import { Session } from "@cabildo-abierto/api";
import {post} from "@/components/utils/react/fetch";
import {Paragraph} from "@/components/utils/base/paragraph";


const WelcomeMessage = ({open, onClose}: { open: boolean, onClose: () => void }) => {
    const {isMobile} = useLayoutConfig()

    return <AcceptButtonPanel
        open={open}
        buttonText={"Aceptar"}
        onClose={onClose}
        className={"py-4 px-4 sm:px-8 w-screen max-w-[500px]"}
        backgroundShadow={true}
    >
        <div className={"flex flex-col items-center sm:text-base text-sm"}>
            <h2 className={"mb-4 py-2 text-xl"}>¡Te damos la bienvenida!</h2>

            <div className={"space-y-3"}>
                <Paragraph>
                    Cabildo Abierto es una incipiente plataforma de discusión argentina.
                </Paragraph>
                <Paragraph>
                    Desde el equipo que la desarrolla intentamos que sirva como una herramienta para comunicarnos y
                    discutir a través de internet de formas más sanas y útiles.
                </Paragraph>
                <Paragraph>
                    Estamos en período de prueba. Ante cualquier comentario, escribinos a @cabildoabierto.ar o comentá en directamente en la plataforma.
                </Paragraph>
                {isMobile && <Paragraph>
                    <span className={"font-semibold"}>Tip:</span> Cabildo Abierto funciona un poco mejor desde una
                    computadora.
                </Paragraph>}
            </div>
        </div>
    </AcceptButtonPanel>
}

const RunTutorial = ({children}: { children: ReactNode }) => {
    const [runStatus, setRunStatus] = useState<"not started" | "welcome" | "guide" | "follows" | "finished">("welcome")
    const {user} = useSession()
    const qc = useQueryClient()

    useEffect(() => {
        if (user) {
            qc.prefetchQuery({queryKey: ["profile", "cabildoabierto.ar"]})
            qc.prefetchQuery({queryKey: ["profile", "bsky.app"]})
        }
    }, [user, runStatus])

    async function setSeenTutorial() {
        qc.setQueryData(["session"], old => {
            return produce(old as Session, draft => {
                draft.seenTutorial.home = true
            })
        })
        await post("/seen-tutorial/home")
    }

    useEffect(() => {
        if (runStatus == "finished") {
            setSeenTutorial()
        }
    }, [runStatus])

    return (
        <>
            {children}
            <WelcomeMessage
                open={runStatus == "welcome"}
                onClose={() => {
                    setRunStatus("guide")
                }}
            />
            {runStatus == "guide" && <AcceptButtonPanel
                buttonText={"Empezar"}
                className={"sm:max-w-[400px]"}
                open={true}
                onClose={() => {
                    setRunStatus("finished")
                }}
            >
                <Paragraph>
                    Para empezar, te recomendamos que busques usuarios para seguir, que explores los muros y que recorras la sección de temas.
                </Paragraph>
            </AcceptButtonPanel>}
        </>
    )
}


export const HomeTutorial = ({children}: { children: ReactNode }) => {
    const params = useSearchParams()
    const {user} = useSession()

    if (user && (params.get("tutorial") || !user.seenTutorial.home)) {
        return (
            <RunTutorial>
                {children}
            </RunTutorial>
        )
    } else {
        return children
    }
}