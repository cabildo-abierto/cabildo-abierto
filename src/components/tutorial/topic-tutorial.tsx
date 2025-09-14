"use client"

import React, {ReactNode, useEffect, useState} from "react";
import Joyride, {CallBackProps, STATUS, Step} from "react-joyride";
import {useSearchParams} from "next/navigation";
import {useSession} from "@/queries/useSession";
import {post} from "@/utils/fetch";
import {useQueryClient} from "@tanstack/react-query";
import {Session, WikiEditorState} from "@/lib/types";
import {produce} from "immer";
import {smoothScrollTo} from "../../../modules/ui-utils/src/scroll";


const TourContent = ({children}: {children: ReactNode}) => {
    return <span className={"text-[var(--text-light)] sm:text-base text-sm"}>{children}</span>
}


const minimizedSteps: Step[] = [
    {
        target: '#topic-header',
        content: <TourContent>
            Estás viendo la página de este tema.
        </TourContent>,
        placement: 'bottom',
        disableBeacon: true,
        hideBackButton: true
    },
    {
        target: '#topic-content',
        content: <TourContent>
            Este es el consenso actual sobre el tema. Cualquiera lo puede editar. El resto de los usuarios pueden validar o rechazar las ediciones.
        </TourContent>,
        placement: 'bottom',
        disableBeacon: true,
        hideBackButton: true
    },
    {
        target: '#discussion-start',
        content: <TourContent>
            Acá te mostramos todo lo que se discutió sobre el tema en Cabildo Abierto: las menciones que hubo y lo que se discutió sobre el contenido.
        </TourContent>,
        placement: 'bottom',
        disableBeacon: true,
        hideBackButton: true
    }
]


const maximizedSteps: Step[] = [
    {
        target: '#topic-header-button-editing',
        content: <TourContent>
            Con este botón podés editar el tema.
        </TourContent>,
        placement: 'bottom',
        disableBeacon: true,
        hideBackButton: true
    },
    {
        target: '#topic-header-button-history',
        content: <TourContent>
            Con este botón podés ver el historial de versiones, donde podés votar a favor o en contra de cada versión y ver los cambios.
        </TourContent>,
        placement: 'bottom',
        disableBeacon: true,
        hideBackButton: true
    },
    {
        target: '#topic-header-button-props',
        content: <TourContent>
            Acá podés ver las propiedades del tema, como sus categorías y sinónimos.
        </TourContent>,
        placement: 'bottom',
        disableBeacon: true,
        hideBackButton: true
    },
    {
        target: '#editor',
        content: <TourContent>
            Esta es la última versión aceptada del tema.
        </TourContent>,
        placement: 'top',
        disableBeacon: true,
        hideBackButton: true
    }
]


const RunTutorial = ({children, wikiState}: { children: ReactNode, wikiState: WikiEditorState }) => {
    const [runStatus, setRunStatus] = useState<"not started" | "running" | "finished">("running")
    const [stepIndex, setStepIndex] = useState<number>(0)
    const qc = useQueryClient()

    const steps: Step[] = wikiState == "minimized" ? minimizedSteps : maximizedSteps

    async function setSeenTutorial() {
        qc.setQueryData(["session"], old => {
            return produce(old as Session, draft => {
                if(wikiState == "minimized") {
                    draft.seenTutorial.topicMinimized = true
                } else {
                    draft.seenTutorial.topicMaximized = true
                }
            })
        })
        await post(`/seen-tutorial/topic-${wikiState}`)
    }

    useEffect(() => {
        if (runStatus == "finished") {
            setSeenTutorial()
        }
    }, [runStatus])

    const handleJoyrideCallback = async (data: CallBackProps) => {
        const {status} = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        smoothScrollTo(0)

        if (data.type == "step:after") {
            setStepIndex(data.index+1)
        } else if (finishedStatuses.includes(status)) {
            setRunStatus("finished")
        }
    };

    return (
        <>
            <Joyride
                steps={steps}
                stepIndex={stepIndex}
                run={runStatus == "running"}
                continuous
                scrollToFirstStep={false}
                disableScrolling={true}
                showProgress={false}
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
        </>
    )
}


const TopicTutorial = ({children, wikiState}: {children: ReactNode, wikiState: WikiEditorState}) => {
    const params = useSearchParams()
    const {user} = useSession()
    const notSeen = wikiState == "minimized" ? user && !user.seenTutorial.topicMinimized : user && !user.seenTutorial.topicMaximized

    if ((params.get("tutorial") || notSeen) && wikiState != "editing"){
        return (
            <RunTutorial wikiState={wikiState}>
                {children}
            </RunTutorial>
        )
    } else {
        return children
    }
}


export default TopicTutorial