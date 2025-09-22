"use client"

import React, {ReactNode, useEffect, useState} from "react";
import Joyride, {CallBackProps, STATUS, Step} from "react-joyride";
import {useSearchParams} from "next/navigation";
import {useSession} from "@/queries/useSession";
import {post} from "@/utils/fetch";
import {useQueryClient} from "@tanstack/react-query";
import {Session} from "@/lib/types";
import {produce} from "immer";
import {useTopics} from "@/queries/useTopics";
import {smoothScrollTo} from "../../../../modules/ui-utils/src/scroll";


const TourContent = ({children}: {children: ReactNode}) => {
    return <span className={"text-[var(--text-light)] sm:text-base text-sm"}>{children}</span>
}


const RunTutorial = ({children}: { children: ReactNode }) => {
    const [runStatus, setRunStatus] = useState<"not started" | "running" | "finished">("not started")
    const [stepIndex, setStepIndex] = useState<number>(0)
    const qc = useQueryClient()
    const {data: topics} = useTopics([], "popular", "week")

    useEffect(() => {
        if(topics){
            setRunStatus("running")
        }
    }, [topics]);

    const steps: Step[] = [
        {
            target: "body",
            content: <TourContent>
                Te damos la bienvenida a la wiki de Cabildo Abierto.
            </TourContent>,
            placement: 'center',
            disableBeacon: true,
            hideBackButton: true
        },
        {
            target: '#topic-search-result',
            content: <TourContent>
                Este es un <span className={"font-semibold"}>tema</span>.
            </TourContent>,
            placement: 'bottom',
            disableBeacon: true,
            hideBackButton: true
        },
        {
            target: '#topic-categories',
            content: <TourContent>
                Acá aparecen las categorías a las que pertenece.
            </TourContent>,
            placement: 'bottom',
            disableBeacon: true,
            hideBackButton: true
        },
        {
            target: '#topic-popularity',
            content: <TourContent>
                Esta es la cantidad de personas que participó en la discusión del tema en la última semana.
            </TourContent>,
            placement: 'bottom',
            disableBeacon: true,
            hideBackButton: true
        },
        {
            target: '#topic-search-result',
            content: <TourContent>
                Cada tema tiene una página propia, podés entrar haciendo clic cuando termine el tutorial.
            </TourContent>,
            placement: 'bottom',
            disableBeacon: true,
            hideBackButton: true
        },
        {
            target: '#lista',
            content: <TourContent>
                En este momento estamos viendo los temas como una lista.
            </TourContent>,
            placement: 'bottom',
            disableBeacon: true,
            hideBackButton: true
        },
        {
            target: '#topics-sort-selector',
            content: <TourContent>
                La lista se puede ordenar por distintos criterios.
            </TourContent>,
            placement: 'bottom',
            disableBeacon: true,
            hideBackButton: true
        },
        {
            target: '#mapa',
            content: <TourContent>
                También podés ver los temas como un mapa.
            </TourContent>,
            placement: 'bottom',
            hideBackButton: true
        },
        {
            target: '#category-selector',
            content: <TourContent>
                Estas son las categorías que se crearon hasta ahora. Podés usarlas para encontrar más rápido temas que te interesen.
            </TourContent>,
            placement: 'bottom',
            hideBackButton: true
        },
        {
            target: '#new-topic-button',
            content: <TourContent>
                ¿Falta algún tema? Crealo con este botón.
            </TourContent>,
            placement: 'bottom',
            hideBackButton: true,
        }
    ]

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


const TopicsPageTutorial = ({children}: {children: ReactNode}) => {
    const params = useSearchParams()
    let {user} = useSession()

    if (params.get("tutorial") || (user && !user.seenTutorial.topics)){
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