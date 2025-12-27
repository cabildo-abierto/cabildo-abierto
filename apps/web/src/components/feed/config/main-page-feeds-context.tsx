import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {AlgorithmConfig, FeedConfig, MainPageFeedsState, Session} from "@cabildo-abierto/api";
import {
    defaultEnDiscusionFormat,
    defaultEnDiscusionMetric,
    defaultEnDiscusionTime
} from "@cabildo-abierto/api";
import {useSession} from "@/components/auth/use-session";
import * as React from "react";
import {useRouter} from "next/navigation";
import {post} from "@/components/utils/react/fetch";
import {useMutation, useQueryClient} from "@tanstack/react-query";


function getDefaultFeedTabs(): MainPageFeedsState {
    return {
        tabs: [
            {
                config: {
                    type: "main",
                    subtype: "siguiendo",
                    filter: "Todos",
                    format: "Todos"
                },
                id: crypto.randomUUID(),
                pinned: true,
                createdAt: new Date()
            },
            {
                config: {
                    type: "main",
                    subtype: "discusion",
                    format: defaultEnDiscusionFormat,
                    time: defaultEnDiscusionTime,
                    metric: defaultEnDiscusionMetric
                },
                id: crypto.randomUUID(),
                pinned: true,
                createdAt: new Date()
            },
            {
                config: {
                    type: "main",
                    subtype: "descubrir"
                },
                id: crypto.randomUUID(),
                pinned: true,
                createdAt: new Date()
            }
        ],
        selected: 0
    }
}


function validMainPageFeedsState(state: MainPageFeedsState): boolean {
    if(state.selected == null || state.selected > state.tabs.length-1 || state.selected < 0) return false
    return !state.tabs.some(t => t == null || !t.id || !t.createdAt)
}


function loadOpenFeeds(user?: Session): MainPageFeedsState {
    try {
        const config = user?.algorithmConfig?.mainPageFeeds
        if(!config) {
            return getDefaultFeedTabs()
        }
        if(!validMainPageFeedsState(config)) {
            return getDefaultFeedTabs()
        }
        return config
    } catch {
        return getDefaultFeedTabs()
    }
}


async function saveOpenTabs({user, state}: {user: Session, state: MainPageFeedsState}) {
    try {
        const newAlgorithmConfig: AlgorithmConfig = {
            ...user.algorithmConfig,
            mainPageFeeds: state
        }
        await post("/algorithm-config", newAlgorithmConfig)
    } catch {}
}


type MainFeedConfigError = "auth required"

const MainPageFeedsContext = createContext<{
    openFeeds?: MainPageFeedsState
    error?: MainFeedConfigError
    select: (i: number, ensureHome: boolean) => void
    config: FeedConfig | null
    addFeed: (f: FeedConfig) => void
    closeTab: (i: number) => void
    configOpen: boolean
    setConfigOpen: (v: boolean) => void
    setConfig: (i: number, c: FeedConfig) => void
    reorderTabs: (p: number[]) => void
} | undefined>(undefined)


export function MainPageFeedsProvider({ children }: {
    children: ReactNode
}) {
    const {user} = useSession()
    const [openFeeds, setOpenFeeds] = useState<MainPageFeedsState>(() => loadOpenFeeds(user))
    const router = useRouter()
    const [configOpen, setConfigOpen] = useState(false)
    const qc = useQueryClient()

    const saveOpenTabsMutation = useMutation({
        mutationFn: saveOpenTabs,
        onMutate: ({user, state}) => {
            const newAlgorithmConfig: AlgorithmConfig = {
                ...user.algorithmConfig,
                mainPageFeeds: state
            }
            qc.setQueryData(["session"], {...user, algorithmConfig: newAlgorithmConfig})
        }
    })

    useEffect(() => {
        setOpenFeeds(loadOpenFeeds(user))
    }, [user?.algorithmConfig])

    function select(i: number, ensureHome: boolean) {
        const newOpenFeeds = {...openFeeds, selected: i}
        setOpenFeeds(newOpenFeeds)
        saveOpenTabsMutation.mutate({user, state: newOpenFeeds})
        if(ensureHome) {
            router.push("/inicio")
        }
    }

    function addFeed(f: FeedConfig) {
        const newOpenFeeds = {
            ...openFeeds,
            tabs: [...openFeeds.tabs, {config: f, pinned: false, id: crypto.randomUUID(), createdAt: new Date()}],
            selected: openFeeds.tabs.length
        }
        setOpenFeeds(newOpenFeeds)
        saveOpenTabsMutation.mutate({user, state: newOpenFeeds})
    }

    function closeTab(i: number) {
        const newOpenFeeds: MainPageFeedsState = {
            ...openFeeds,
            tabs: openFeeds.tabs.filter((_, j) => j != i),
            selected: i == openFeeds.tabs.length-1 ? (i > 0 ? i-1 : null) : i
        }
        setOpenFeeds(newOpenFeeds)
        saveOpenTabsMutation.mutate({user, state: newOpenFeeds})
    }

    function setConfig(i: number, c: FeedConfig) {
        const newOpenFeeds = {
            ...openFeeds,
            tabs: openFeeds.tabs.map((t, j) => j == i ? {...t, config: c} : t)
        }
        setOpenFeeds(newOpenFeeds)
        saveOpenTabsMutation.mutate({user, state: newOpenFeeds})
    }

    function reorderTabs(p: number[]) {
        if(!p.some((x, i) => i != x)) return
        const tabs = p.map(i => openFeeds.tabs[i])
        const newOpenFeeds = {
            ...openFeeds,
            tabs,
            selected: p[openFeeds.selected]
        }
        setOpenFeeds(newOpenFeeds)
        saveOpenTabsMutation.mutate({user, state: newOpenFeeds})
    }

    const config = openFeeds.selected != null && openFeeds.selected < openFeeds.tabs.length ? openFeeds.tabs[openFeeds.selected].config : null

    const error: MainFeedConfigError | undefined = !user && ["siguiendo", "custom", "descubrir"].includes(config.subtype) ? "auth required" : undefined

    return (
        <MainPageFeedsContext.Provider
            value={{openFeeds, select, config, error, addFeed, closeTab, configOpen, setConfig, setConfigOpen, reorderTabs}}
        >
            {children}
        </MainPageFeedsContext.Provider>
    )
}

export function useMainPageFeeds() {
    const ctx = useContext(MainPageFeedsContext)
    if (!ctx) throw new Error("Missing MainPageFeedsProvider")
    return ctx
}