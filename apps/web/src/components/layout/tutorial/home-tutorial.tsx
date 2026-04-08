"use client"

import React, {ReactNode, useEffect, useMemo, useState} from "react";
import {useSearchParams} from "next/navigation";
import {AcceptButtonPanel} from "../../utils/dialogs/accept-button-panel";
import {useSession} from "@/components/auth/use-session";
import {useQueryClient} from "@tanstack/react-query";
import {produce} from "immer";
import {useLayoutConfig} from "../main-layout/layout-config-context";
import {Session} from "@cabildo-abierto/api";
import {post} from "@/components/utils/react/fetch";
import {Paragraph} from "@/components/utils/base/paragraph";
import {SearchBar} from "@/components/utils/base/search-bar";
import {useProfile} from "@/components/perfil/use-profile";
import {useSearchUsers} from "@/components/buscar/user-search-results";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {ProfilePic} from "@/components/perfil/profile-pic";
import {FollowButton} from "@/components/perfil/follows";


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
                    Estamos en período de prueba. Por cualquier comentario o pregunta podés escribirnos a @cabildoabierto.ar o comentar directamente en la plataforma.
                </Paragraph>
                {isMobile && <Paragraph>
                    <span className={"font-semibold"}>Tip:</span> Cabildo Abierto funciona un poco mejor desde una
                    computadora.
                </Paragraph>}
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
    const {data: results, isLoading} = useSearchUsers(searchState, 25)
    const qc = useQueryClient()

    const resultsWithSuggestions = useMemo(() => {
        if (!results && caProfile && bskyProfile) {
            return {
                success: true,
                value: [
                    caProfile,
                    bskyProfile
                ]
            }
        }
        return results
    }, [results, searchState, caProfile, bskyProfile])

    if (!profile) {
        return null
    }

    function onFinishIntro() {
        qc.refetchQueries({
            predicate: query => {
                const k = query.queryKey
                return Array.isArray(k) && k.length >= 2 && k[0] == "main-feed" && k[1] == "siguiendo"
            }
        })
        onClose()
    }

    return <AcceptButtonPanel
        open={open}
        buttonText={"Aceptar"}
        onClose={onFinishIntro}
        className={"py-4 flex flex-col items-center px-4 sm:px-8"}
    >
        <div className={"flex flex-col items-center min-[500px]:w-[400px] h-[70vh]"}>
            <h2 className={"my-4 text-base w-full sm:text-lg"}>Elegí algunos usuarios para seguir</h2>

            <div className={"w-full"}>
                <SearchBar
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
                {resultsWithSuggestions?.success && resultsWithSuggestions.value.map(r => (
                    <div
                        key={r.did}
                        className="w-1/2 min-[400px]:w-1/3 p-1 box-border"
                    >
                        <div
                            className="bg-[var(--background-dark2)] p-2 w-full aspect-[0.82] flex flex-col items-center justify-between space-y-1 text-center overflow-hidden"
                        >
                            <div className={"pointer-events-none mb-2"}>
                                <ProfilePic user={r} className="w-14 h-14 rounded-full" descriptionOnHover={false}/>
                            </div>
                            <div className="text-sm px-1 truncate max-w-full whitespace-nowrap">
                                {r.displayName}
                            </div>
                            <div
                                className="text-xs px-1 truncate max-w-full whitespace-nowrap text-[var(--text-light)]">
                                @{r.handle}
                            </div>
                            <FollowButton
                                handle={r.handle}
                                profile={r}
                                dense={true}
                            />
                        </div>
                    </div>
                ))}
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
                    setRunStatus("follows")
                }}
            />
            {runStatus == "guide" && <AcceptButtonPanel
                buttonText={"Empezar"}
                className={"sm:max-w-[400px] flex flex-col items-center"}
                open={true}
                onClose={() => {
                    setRunStatus("finished")
                }}
            >
                <div className={"text-center text-lg font-medium mb-4"}>
                    ¡Todo listo!
                </div>
                <Paragraph>
                    Para empezar, te recomendamos que explores los muros y recorras la sección de temas.
                </Paragraph>
            </AcceptButtonPanel>}
            <FirstFollowsMessage
                open={runStatus == "follows"}
                onClose={() => {setRunStatus("guide")}}
            />
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