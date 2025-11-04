"use client"

import React, {ReactNode, useEffect, useState} from "react";
import {useSearchParams} from "next/navigation";
import {AcceptButtonPanel} from "../dialogs/accept-button-panel";
import {useSession} from "@/queries/getters/useSession";
import {post} from "@/utils/fetch";
import {useQueryClient} from "@tanstack/react-query";
import {Session} from "@/lib/types";
import {produce} from "immer";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {useProfile} from "@/queries/getters/useProfile";


const WelcomeMessage = ({open, onClose}: { open: boolean, onClose: () => void }) => {
    const {isMobile} = useLayoutConfig()

    return <AcceptButtonPanel
        open={open}
        buttonText={"Aceptar"}
        onClose={onClose}
        className={"py-4 px-8"}
        backgroundShadow={true}
    >
        <div className={"flex flex-col items-center max-w-[500px] sm:text-base text-sm"}>
            <h2 className={"mb-4 py-2"}>¡Te damos la bienvenida!</h2>

            <div className={"text-[var(--text-light)] font-light space-y-3"}>
                <div>
                    Cabildo Abierto es una incipiente plataforma de discusión argentina.
                </div>
                <div>
                    Desde el equipo que la desarrolla intentamos que sirva como una herramienta para comunicarnos y
                    discutir a través de internet de formas más sanas y útiles para todos los que participamos.
                </div>
                <div>
                    Estamos en período de prueba. Ante cualquier comentario, escribinos a @cabildoabierto.ar o comentá
                    en cualquier contenido de la plataforma.
                </div>
                {isMobile && <div className={""}>
                    <span className={"font-semibold"}>Nota.</span> Cabildo Abierto funciona un poco mejor desde una
                    computadora.
                </div>}
            </div>
        </div>
    </AcceptButtonPanel>
}

const RunTutorial = ({children}: { children: ReactNode }) => {
    const [runStatus, setRunStatus] = useState<"not started" | "welcome" | "guide" | "follows" | "finished">("welcome")
    const {user} = useSession()
    const {data: profile} = useProfile(user.handle)
    const qc = useQueryClient()
    const searchParams = useSearchParams()

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
                className={"max-w-[400px] font-light"}
                open={true}
                onClose={() => {
                    if (profile && profile.bskyFollowsCount <= 1 || searchParams.get("tutorial")) {
                        setRunStatus("follows")
                    } else {
                        setRunStatus("finished")
                    }
                }}>
                Para empezar, te recomendamos que busques usuarios para seguir, que explores los muros y sus
                configuraciones y que recorras la sección de temas.
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