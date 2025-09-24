"use client"

import React, {ReactNode, useEffect, useState} from "react";
import Joyride, {CallBackProps, STATUS, Step} from "react-joyride";
import {useSearchParams} from "next/navigation";
import {useSession} from "@/queries/useSession";
import {post} from "@/utils/fetch";
import {useQueryClient} from "@tanstack/react-query";
import {Session, WikiEditorState} from "@/lib/types";
import {produce} from "immer";
import {smoothScrollTo} from "../../../../modules/ui-utils/src/scroll";
import {tutorialLocale, tutorialStyles} from "@/components/layout/tutorial/styles";
import {CustomJoyrideTooltip} from "@/components/layout/tutorial/custom-tooltip";


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
            Este es el contenido actual sobre el tema. Cualquiera lo puede editar. El resto de los usuarios pueden validar o rechazar las ediciones.
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


const RunTutorial = ({children}: { children: ReactNode }) => {
    const [runStatus, setRunStatus] = useState<"not started" | "running" | "finished">("running")
    const [stepIndex, setStepIndex] = useState<number>(0)
    const qc = useQueryClient()

    const steps: Step[] = minimizedSteps

    async function setSeenTutorial() {
        qc.setQueryData(["session"], old => {
            return produce(old as Session, draft => {
                draft.seenTutorial.topicMinimized = true
            })
        })
        await post(`/seen-tutorial/topic-minimized`)
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
                locale={tutorialLocale}
                styles={tutorialStyles}
                tooltipComponent={CustomJoyrideTooltip}
            />
            {children}
        </>
    )
}


const TopicTutorial = ({children, wikiState}: {children: ReactNode, wikiState: WikiEditorState}) => {
    const params = useSearchParams()
    const {user} = useSession()
    const notSeen = user && !user.seenTutorial.topicMinimized

    if (user && (params.get("tutorial") || notSeen) && wikiState != "editing"){
        return (
            <RunTutorial>
                {children}
            </RunTutorial>
        )
    } else {
        return children
    }
}


export default TopicTutorial