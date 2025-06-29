"use client"

import React, {ReactNode, useEffect, useState} from "react";
import Joyride, {CallBackProps, STATUS, Step} from "react-joyride";
import {useSearchParams} from "next/navigation";
import {smoothScrollTo} from "../../../modules/ca-lexical-editor/src/plugins/TableOfContentsPlugin";
import {AcceptButtonPanel} from "../../../modules/ui-utils/src/accept-button-panel";
import {useSession} from "@/queries/api";
import {post} from "@/utils/fetch";
import {useQueryClient} from "@tanstack/react-query";
import {Session} from "@/lib/types";
import {produce} from "immer";


const WelcomeMessage = ({open, onClose}: {open: boolean, onClose: () => void}) => {
    return <AcceptButtonPanel open={open} buttonText={"Empezar"} onClose={onClose} className={"py-4 px-8"}>
        <div className={"flex flex-col items-center max-w-[600px]"}>
            <h2 className={"mb-4"}>¡Bienvenida/o!</h2>

            <div className={"text-[var(--text-light)] space-y-3"}>
                <div>
                    Cabildo Abierto es una incipiente plataforma de discusión argentina.
                </div>
                <div>
                    Desde el equipo que la desarrolla intentamos que sirva como una herramienta para discutir ideas y mejorar colectivamente la calidad de la información disponible.
                </div>
                <div>
                    Estamos en período de prueba. Ante cualquier comentario no dudes en escribirnos a contacto@cabildoabierto.ar o comentar directamente en la plataforma.
                </div>
            </div>
        </div>
    </AcceptButtonPanel>
}


export const RunTutorial = ({children}: {children: ReactNode}) => {
    const [run, setRun] = useState(false)
    const [showingWelcomeMessage, setShowingWelcomeMessage] = useState(true)
    const [startedRun, setStartedRun] = useState(false)
    const [steps] = useState<Step[]>([
        {
            target: '#siguiendo',
            content: 'El muro con las personas que seguís. Igual a Bluesky o Twitter pero también hay artículos.',
            placement: 'bottom',
            disableBeacon: true
        },
        {
            target: '#discusion',
            content: 'Un muro con lo más popular en Cabildo Abierto.',
            placement: 'bottom',
        },
        {
            target: '#descubrir',
            content: 'Un muro para explorar contenidos de personas que no seguís.',
            placement: 'bottom',
        },
        {
            target: 'body',
            content: 'Ninguno de los muros usa IA. Dicen por ahí que lo viejo funciona...',
            placement: 'center',
            disableBeacon: true,
            spotlightClicks: false,
        },
        {
            target: '#temas',
            content: 'Una wiki sobre los temas en discusión, con los consensos de la plataforma, visualizaciones y más.',
            placement: 'bottom',
        },
        {
            target: '#write-button',
            content: 'Escribí publicaciones rápidas y artículos o editá temas de discusión.',
            placement: 'bottom',
        }
    ])

    const qc = useQueryClient()

    useEffect(() => {
        const isMobile = window.innerWidth <= 800

        if(!showingWelcomeMessage){
            if(!isMobile){
                setRun(true)
            }
            setStartedRun(true)
        }

    }, [showingWelcomeMessage])

    async function setSeenTutorial() {
        qc.setQueryData(["session"], old => {
            return produce(old as Session, draft => {
                draft.seenTutorial = true
            })
        })
        await post("/seen-tutorial")
    }

    useEffect(() => {
        if (startedRun && !run) {
            setSeenTutorial()
        }
    }, [run, startedRun]);

    const handleJoyrideCallback = async (data: CallBackProps) => {
        const { status } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        smoothScrollTo(0)

        if (finishedStatuses.includes(status)) {
            setRun(false)
        }
    };

    return (
        <>
            <Joyride
                steps={steps}
                run={run}
                continuous
                scrollToFirstStep={false}
                disableScrolling={true}
                showProgress={false}
                showSkipButton
                disableOverlayClose={true}
                spotlightClicks={true}
                callback={handleJoyrideCallback}
                locale={{
                    back: 'Volver',
                    close: 'Cerrar',
                    last: 'Finalizar',
                    next: 'Siguiente',
                    skip: 'Saltar intro',
                }}
                styles={{
                    options: {
                        zIndex: 10000,
                        arrowColor: 'var(--background-dark)',
                        backgroundColor: 'var(--background-dark)',
                        overlayColor: 'rgba(0, 0, 0, 0.5)',
                        primaryColor: 'var(--primary)',
                        textColor: 'var(--text)',
                    },
                    tooltip: {
                        fontSize: '16px',
                        padding: '16px',
                        borderRadius: '12px',
                    },
                    tooltipContainer: {
                        textAlign: 'left',
                    },
                    buttonNext: {
                        backgroundColor: 'var(--primary)',
                        color: 'var(--button-text)',
                        fontSize: '14px'
                    },
                    buttonBack: {
                        color: 'var(--text-light)',
                        marginRight: 8,
                        fontSize: '14px',
                    },
                    buttonClose: {
                        display: 'none',
                        fontSize: '14px',
                    },
                    buttonSkip: {
                        fontSize: '14px',
                        color: 'var(--text-light)',
                    },
                }}
            />
            {children}
            <WelcomeMessage open={showingWelcomeMessage} onClose={() => {setShowingWelcomeMessage(false)}}/>
        </>
    )
}


export const Tutorial = ({children}: {children: ReactNode}) => {
    const params = useSearchParams()
    const {user} = useSession()

    const showAnyways = false
    if(params.get("tutorial") || (user && (showAnyways || !user.seenTutorial))){
        return (
            <RunTutorial>
                {children}
            </RunTutorial>
        )
    } else {
        return children
    }
}