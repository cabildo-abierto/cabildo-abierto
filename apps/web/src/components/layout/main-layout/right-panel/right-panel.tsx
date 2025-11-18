import React from "react";
import {TrendingTopicsPanel} from "./trending-topics/trending-topics";
import {usePathname, useRouter} from "next/navigation";
import {RightPanelButtons} from "./right-panel-buttons";
import {Logo} from "@/components/utils/icons/logo";
import Link from "next/link";
import {useNextMeeting} from "@/queries/getters/useNextMeeting";
import {formatIsoDate} from "@cabildo-abierto/utils";
import FollowSuggestions from "./follow-suggestions";
import {BaseButton} from "@/components/utils/base/base-button";
import DonateIcon from "@/components/utils/icons/donate-icon";
import {useSearch} from "../../../buscar/search-context";
import SearchResultsOnRightPanel from "../../../buscar/search-results-on-right-panel";
import {useSession} from "@/components/auth/use-session";
import {useLayoutConfig} from "../layout-config-context";
import {createPortal} from "react-dom";
import {useAPI} from "@/components/utils/react/queries";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import ShareIcon from "@/components/utils/icons/share-icon";

type ServerStatus = {
    worker: boolean
    mirror: boolean
}

function useServerStatus() {
    return useAPI<{ status: ServerStatus }>("/status", ["status"], 60*1000)
}


const ServerStatus = () => {
    const {data, isLoading} = useServerStatus()

    if(isLoading) return <LoadingSpinner className={"h-[10px] w-[10px]"}/>

    if(!data) return null

    return <Link className={"fixed bottom-2 right-2 space-x-1 flex"} href={"/admin"}>
        <div className={"rounded-full w-1 h-1 " + (data.status.worker ? "bg-green-500" : "bg-red-500")} title={"worker"}/>
        <div className={"rounded-full w-1 h-1 " + (data.status.mirror ? "bg-green-500": "bg-red-500")} title={"mirror"}/>
    </Link>
}


const NextMeetingOnRightPanel = () => {
    const {data: meetingData} = useNextMeeting()

    return meetingData && meetingData.show && <div className={"panel p-2 text-sm"}>
        <div className={"font-semibold"}>
            {meetingData.title}
        </div>
        <div className={"text-[var(--text-light)] text-[11.8px]"}>
            {meetingData.description}
        </div>
        <div className={"text-[var(--text-light)]"}>
            <span className={"font-semibold"}>Link:</span> <Link
            href={meetingData.url}
            target={"_blank"}
            className={"hover:underline"}
        >
            {meetingData.url.replace("https://", "")}
        </Link>
        </div>
        <div className={"text-[var(--text-light)]"}>
            {formatIsoDate(meetingData.date, true, true, false)}hs.
        </div>
    </div>
}


function useRightPanelConfig() {
    const pathname = usePathname()
    const isFollowSuggestionsPath = (pathname.startsWith("/inicio")
            || pathname.startsWith("/perfil")
            || pathname.startsWith("/buscar")
            || pathname.startsWith("/tema/menciones")
        )
        && !pathname.startsWith("/perfil/cuentas-sugeridas")

    const isDonatePath = !pathname.startsWith("/aportar")

    const isTrendingTopicsPath = isFollowSuggestionsPath

    return {isFollowSuggestionsPath, isTrendingTopicsPath, isDonatePath}
}


function useInSearchPage() {
    const pathname = usePathname()
    const inSearchPage = pathname.startsWith("/buscar") || pathname.startsWith("/temas")
    return {inSearchPage}
}


export const RightPanel = () => {
    const {user} = useSession()
    const router = useRouter()
    const pathname = usePathname()
    const {searchState} = useSearch(`${pathname}::main`)
    const {inSearchPage} = useInSearchPage()
    const {layoutConfig} = useLayoutConfig()
    const {isFollowSuggestionsPath, isTrendingTopicsPath, isDonatePath} = useRightPanelConfig()

    const showSearchButton = searchState.searching && searchState.value.length > 0

    const searching = searchState.searching && searchState.value.length > 0
    const handleSubmit = () => {
        if (searchState.value.length > 0) {
            router.push("/buscar?q=" + encodeURIComponent(searchState.value));
        }
    }

    if (!layoutConfig.openRightPanel) {
        return searching && !inSearchPage && createPortal(<div className={"z-[1500] fixed right-2 top-14"}>
            <div className={"w-[292px]"}>
                <SearchResultsOnRightPanel
                    showSearchButton={showSearchButton}
                    handleSubmit={handleSubmit}
                />
            </div>
        </div>, document.body)
    }

    return <div className={"flex flex-col pr-2 space-y-6 pt-2"}>
        {searching && !inSearchPage && <div className={"w-[292px]"}>
            <SearchResultsOnRightPanel
                showSearchButton={showSearchButton}
                handleSubmit={handleSubmit}
            />
        </div>}

        <div className={"flex justify-center mt-4"}>
            <Logo width={32} height={32}/>
        </div>

        {pathname.includes("inicio") && <NextMeetingOnRightPanel/>}

        {isTrendingTopicsPath && <div className={"w-[292px]"}>
            <TrendingTopicsPanel/>
        </div>}

        {isFollowSuggestionsPath && user && <div className={"w-[292px]"}>
            <FollowSuggestions/>
        </div>}

        {isDonatePath && <div className={"flex space-x-2"}>
            <Link href={"/aportar"}>
                <BaseButton
                    startIcon={<DonateIcon/>}
                    size="small"
                    variant={"outlined"}
                >
                    Aportar
                </BaseButton>
            </Link>
            <Link href={"/ajustes/compartir"}>
                <BaseButton
                    startIcon={<ShareIcon/>}
                    size="small"
                    variant={"outlined"}
                >
                    Invitar
                </BaseButton>
            </Link>
        </div>}

        <div className={"text-sm mt-4 pb-8"}>
            <RightPanelButtons/>
        </div>

        {user && user.platformAdmin && <ServerStatus/>}
    </div>
}