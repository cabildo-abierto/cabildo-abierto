import {createContext, ReactNode, useContext, useState} from "react";
import {FeedConfig, Session} from "@cabildo-abierto/api";
import {
    defaultEnDiscusionFormat,
    defaultEnDiscusionMetric,
    defaultEnDiscusionTime
} from "@cabildo-abierto/api";
import {useSession} from "@/components/auth/use-session";
import * as React from "react";
import {useRouter} from "next/navigation";


const payloadVersion = 1


export type FeedTab =  {
    config: FeedConfig
    id: string
    pinned: boolean
    createdAt: Date
}


export type MainPageFeedsState = {
    tabs: FeedTab[]
    selected: number | null
    version: number
}


function getDefaultFeedTabs(user: Session): MainPageFeedsState {
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
        selected: 0,
        version: payloadVersion
    }
}


function validMainPageFeedsState(state: MainPageFeedsState): boolean {
    if(state.version != payloadVersion) return false
    if(state.selected == null || state.selected > state.tabs.length-1 || state.selected < 0) return false
    return !state.tabs.some(t => t == null || !t.id || !t.createdAt)
}


function loadOpenFeeds(user: Session): MainPageFeedsState {
    if (typeof window === "undefined") return {
        tabs: [],
        selected: null,
        version: payloadVersion
    }
    try {
        const raw = localStorage.getItem("main-page-feeds-state")
        if(!raw) {
            return getDefaultFeedTabs(user)
        }
        const parsed = JSON.parse(raw) as MainPageFeedsState
        if(!validMainPageFeedsState(parsed)) {
            return getDefaultFeedTabs(user)
        }
        return parsed
    } catch {
        return getDefaultFeedTabs(user)
    }
}


function saveOpenTabs(state: MainPageFeedsState) {
    try {
        localStorage.setItem("main-page-feeds-state", JSON.stringify(state))
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

    function select(i: number, ensureHome: boolean) {
        const newOpenFeeds = {...openFeeds, selected: i}
        setOpenFeeds(newOpenFeeds)
        saveOpenTabs(newOpenFeeds)
        if(ensureHome) {
            router.push("/inicio")
        }
    }

    function addFeed(f: FeedConfig) {
        const newOpenFeeds = {
            ...openFeeds,
            tabs: [...openFeeds.tabs, {config: f, pinned: false, id: crypto.randomUUID(), createdAt: new Date()}]
        }
        setOpenFeeds(newOpenFeeds)
        saveOpenTabs(newOpenFeeds)
    }

    function closeTab(i: number) {
        const newOpenFeeds: MainPageFeedsState = {
            ...openFeeds,
            tabs: openFeeds.tabs.filter((_, j) => j != i),
            selected: i == openFeeds.tabs.length-1 ? (i > 0 ? i-1 : null) : i
        }
        setOpenFeeds(newOpenFeeds)
        saveOpenTabs(newOpenFeeds)
    }

    function setConfig(i: number, c: FeedConfig) {
        const newOpenFeeds = {
            ...openFeeds,
            tabs: openFeeds.tabs.map((t, j) => j == i ? {...t, config: c} : t)
        }
        setOpenFeeds(newOpenFeeds)
        saveOpenTabs(newOpenFeeds)
    }

    function renameFeed(id: string, name: string) {
        const newOpenFeeds = {
            ...openFeeds,
            tabs: openFeeds.tabs.map(t => t.id == id ? {...t, name} : t)
        }
        setOpenFeeds(newOpenFeeds)
        saveOpenTabs(newOpenFeeds)
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
        saveOpenTabs(newOpenFeeds)
    }

    const config = openFeeds.selected != null ? openFeeds.tabs[openFeeds.selected].config : null

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