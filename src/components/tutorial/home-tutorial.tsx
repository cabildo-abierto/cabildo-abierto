"use client"

import React, {ReactNode, useEffect, useMemo, useState} from "react";
import Joyride, {CallBackProps, STATUS, Step} from "react-joyride";
import {useSearchParams} from "next/navigation";
import {smoothScrollTo} from "../../../modules/ca-lexical-editor/src/plugins/TableOfContentsPlugin";
import {AcceptButtonPanel} from "../../../modules/ui-utils/src/accept-button-panel";
import {useSession} from "@/queries/useSession";
import {post} from "@/utils/fetch";
import {useQueryClient} from "@tanstack/react-query";
import {Session} from "@/lib/types";
import {produce} from "immer";
import {useSearchUsers} from "@/components/buscar/user-search-results";
import SearchBar from "@/components/buscar/search-bar";
import {ProfilePic} from "@/components/profile/profile-pic";
import {FollowButton} from "@/components/profile/profile-utils";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {useProfile} from "@/queries/useProfile";


const WelcomeMessage = ({open, onClose}: { open: boolean, onClose: () => void }) => {
    return <AcceptButtonPanel open={open} buttonText={"Empezar"} onClose={onClose} className={"py-4 px-8"}>
        <div className={"flex flex-col items-center max-w-[500px] sm:text-base text-sm"}>
            <h2 className={"mb-4 py-2"}>¡Te damos la bienvenida!</h2>

            <div className={"text-[var(--text-light)] space-y-3"}>
                <div>
                    Cabildo Abierto es una incipiente plataforma de discusión argentina.
                </div>
                <div>
                    Desde el equipo que la desarrolla intentamos que sirva como una herramienta para discutir ideas y
                    mejorar colectivamente la calidad de la información disponible.
                </div>
                <div>
                    Estamos en período de prueba. Ante cualquier comentario, escribinos a @cabildoabierto.ar o comentá
                    en cualquier contenido de la plataforma.
                </div>
                <div className={"sm:hidden bg-[var(--background-dark2)] p-2 rounded"}>
                    <span className={"font-semibold"}>Nota.</span> Eventualmente vamos a tener una app, pero por ahora algunas funcionalidades no están disponibles en el celular.
                </div>
            </div>
        </div>
    </AcceptButtonPanel>
}


const FirstFollowsMessage = ({open, onClose}: {
    open: boolean
    onClose: () => void
}) => {
    const {user} = useSession()
    const {data: profile} = useProfile(user.handle)
    const {data: caProfile} = useProfile("cabildoabierto.ar")
    const {data: bskyProfile} = useProfile("bsky.app")
    const [searchState, setSearchState] = useState({searching: false, value: ""})
    const {results, isLoading} = useSearchUsers(searchState)

    const resultsWithSuggestions = useMemo(() => {
        if (!results && caProfile && bskyProfile) {
            return [
                caProfile.bsky,
                bskyProfile.bsky
            ]
        }
        return results
    }, [results, searchState, caProfile, bskyProfile])

    if (!profile) {
        return null
    }

    return <AcceptButtonPanel open={open} buttonText={"Terminar intro"} onClose={onClose} className={"py-4 flex flex-col items-center px-4 sm:px-8"}>
        <div className={"flex flex-col items-center min-[500px]:w-[400px] h-[70vh]"}>
            <h2 className={"mb-4 text-xl sm:text-2xl"}>Siguiendo a los primeros usuarios</h2>

            <div className={"text-[var(--text-light)] space-y-3 text-sm"}>
                Antes de terminar, te sugerimos buscar algunos usuarios para seguir.
            </div>

            <div className={"mt-4 w-full"}>
                <SearchBar
                    fullWidth={true}
                    color={"background-dark2"}
                    searchValue={searchState.value}
                    setSearchValue={v => {
                        setSearchState({value: v, searching: searchState.searching})
                    }}
                    setSearching={v => {
                        if (v) setSearchState({value: searchState.value, searching: true})
                        else setSearchState({value: "", searching: false})
                    }}
                />
            </div>

            <div className="flex flex-wrap w-full h-full max-w-full sm:max-w-[400px] overflow-y-auto no-scrollbar mt-4">
                {(isLoading || !bskyProfile || !caProfile) && <LoadingSpinner/>}
                {resultsWithSuggestions && resultsWithSuggestions.map(r => (
                    <div
                        key={r.did}
                        className="w-1/2 min-[400px]:w-1/3 p-1 box-border"
                    >
                        <div
                            className="rounded bg-[var(--background-dark2)] py-2 w-full aspect-[0.82] flex flex-col items-center justify-center space-y-1 text-center overflow-hidden"
                        >
                            <div className={"pointer-events-none"}>
                                <ProfilePic user={r} className="w-14 h-14 rounded-full" descriptionOnHover={false}/>
                            </div>
                            <div className="text-sm px-1 truncate max-w-full whitespace-nowrap">
                                {r.displayName}
                            </div>
                            <div className="text-xs px-1 truncate max-w-full whitespace-nowrap text-[var(--text-light)]">
                                @{r.handle}
                            </div>
                            <div className={""}>
                                <FollowButton
                                    handle={r.handle}
                                    profile={r}
                                    dense={false}
                                    backgroundColor={"background-dark2"}
                                    textClassName={"text-xs"}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </AcceptButtonPanel>
}


const TourContent = ({children}: {children: ReactNode}) => {
    return <span className={"text-[var(--text-light)] sm:text-base text-sm"}>{children}</span>
}


const RunTutorial = ({children}: { children: ReactNode }) => {
    const [runStatus, setRunStatus] = useState<"not started" | "welcome" | "running" | "waiting sidebar" | "finished" | "follows">("welcome")
    const {user} = useSession()
    const [stepIndex, setStepIndex] = useState<number>(0)
    const {data: profile} = useProfile(user.handle)
    const qc = useQueryClient()
    const {layoutConfig, setLayoutConfig} = useLayoutConfig()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (user) {
            qc.prefetchQuery({queryKey: ["profile", "cabildoabierto.ar"]})
            qc.prefetchQuery({queryKey: ["profile", "bsky.app"]})
        }
    }, [user, runStatus])

    useEffect(() => {
        if (profile && profile.bsky.followsCount == 1) {
            post<{}, {}>("/clear-follows")
        }
    }, [profile]);

    const [steps, setSteps] = useState<Step[]>([
        {
            target: "body",
            content: <TourContent>
                Empecemos con un pequeño tour.
            </TourContent>,
            placement: 'center',
            disableBeacon: true,
            hideBackButton: true
        },
        {
            target: '#siguiendo',
            content: <TourContent>
                El muro con las personas que seguís. Igual a X o Bluesky, pero también hay artículos.
            </TourContent>,
            placement: 'bottom',
            disableBeacon: true,
            hideBackButton: true
        },
        {
            target: '#discusion',
            content: <TourContent>
                Un muro con lo más popular en Cabildo Abierto. Sin personalización con IA.
            </TourContent>,
            placement: 'bottom',
            hideBackButton: true
        },
        {
            target: '#feed-config-button',
            content: <TourContent>
                Ambos muros se pueden configurar. Podés filtrarlos para ver solo artículos, solo usuarios de Cabildo Abierto o cambiar el criterio con el que se ordenan los contenidos.
            </TourContent>,
            placement: 'bottom',
            hideBackButton: true
        },
        {
            target: '#temas',
            content: <TourContent>
                Una wiki (como Wikipedia) sobre los temas en discusión, con los consensos de la plataforma, visualizaciones y más.
            </TourContent>,
            placement: 'bottom',
            hideBackButton: true
        },
        {
            target: '#write-button',
            content: <TourContent>
                Escribí publicaciones rápidas y artículos, editá temas de la wiki o creá temas nuevos.
            </TourContent>,
            placement: 'bottom',
            hideBackButton: true
        },
        {
            target: '#trending-topics',
            content: <TourContent>
                Los temas de la wiki en tendencia. Cada uno tiene un artículo asociado.
            </TourContent>,
            placement: 'bottom',
            hideBackButton: true,
        },
        {
            target: "body",
            content: <TourContent>
                Eso es todo por ahora. Cuando vayas a la sección Temas vas a encontrar otro tour.
                Si querés profundizar sobre algo también podés explorar los temas sobre Cabildo Abierto.
            </TourContent>,
            placement: 'center',
            disableBeacon: true,
            hideBackButton: true
        },
    ])

    useEffect(() => {
        if(!layoutConfig.openRightPanel || !layoutConfig.spaceForRightSide){
            const i = steps
                .findIndex(x => x.target == "#trending-topics")
            if(i != -1){
                setSteps(steps.toSpliced(i))
            }
        }
    }, [layoutConfig, steps])

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

    useEffect(() => {
        async function waitForSidebarRender(){
            for(let i = 0; i < 3; i++){
                const element = document.getElementById("temas")
                await new Promise(resolve => setTimeout(resolve, 100))
                if(element){
                    setRunStatus("running")
                    setStepIndex(3)
                    break
                }
            }
        }

        if(runStatus == "waiting sidebar") {
            if(layoutConfig.openSidebar){
                waitForSidebarRender()
            }
        }
    }, [runStatus, layoutConfig]);

    const handleJoyrideCallback = async (data: CallBackProps) => {
        const {status} = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        smoothScrollTo(0)

        if (data.type === "step:after" && data.index === 2) {
            setRunStatus("waiting sidebar")
            setLayoutConfig({
                ...layoutConfig,
                openSidebar: true
            })
        } else if (data.type == "step:after") {
            setStepIndex(data.index+1)
        } else if (finishedStatuses.includes(status)) {
            if (profile && profile.bsky.followsCount <= 1 || searchParams.get("tutorial")) {
                setRunStatus("follows")
                if(!layoutConfig.spaceForRightSide){
                    setLayoutConfig({
                        ...layoutConfig,
                        openSidebar: false
                    })
                }
            } else {
                setRunStatus("finished")
            }
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
            <WelcomeMessage open={runStatus == "welcome"} onClose={() => {
                setRunStatus("running")
            }}/>
            {runStatus == "follows" && <FirstFollowsMessage
                open={true}
                onClose={() => {
                    setRunStatus("finished")
                }}
            />}
        </>
    )
}


export const HomeTutorial = ({children}: { children: ReactNode }) => {
    const params = useSearchParams()
    const {user} = useSession()

    const showAnyways = false
    if (params.get("tutorial") || (user && (showAnyways || !user.seenTutorial.home))){
        return (
            <RunTutorial>
                {children}
            </RunTutorial>
        )
    } else {
        return children
    }
}