import React from "react";
import {TrendingTopicsPanel} from "@/components/topics/trending-topics/trending-topics";
import {usePathname, useRouter} from "next/navigation";
import {RightPanelButtons} from "@/components/layout/right-panel-buttons";
import {Logo} from "../../../modules/ui-utils/src/logo";
import Link from "next/link";
import {useNextMeeting} from "@/queries/useNextMeeting";
import {formatIsoDate} from "@/utils/dates";
import FollowSuggestions from "@/components/layout/follow-suggestions";
import {Button} from "../../../modules/ui-utils/src/button";
import DonateIcon from "@/components/icons/donate-icon";
import {useSearch} from "@/components/buscar/search-context";
import UserSearchResultsOnRightPanel from "@/components/buscar/user-search-results-on-right-panel";
import {useSession} from "@/queries/useSession";
import {useLayoutConfig} from "@/components/layout/layout-config-context";


export const RightPanel = () => {
    const pathname = usePathname();
    const {user} = useSession()
    const {data: meetingData} = useNextMeeting()
    const router = useRouter()
    const {searchState} = useSearch()
    const {layoutConfig} = useLayoutConfig()

    const showSearchButton = searchState.searching && searchState.value.length > 0

    const searching = searchState.searching && searchState.value.length > 0
    const handleSubmit = () => {
        if (searchState.value.length > 0) {
            router.push("/buscar?q=" + encodeURIComponent(searchState.value));
        }
    }

    const isFollowSuggestionsPath = ![
        "/perfil/cuentas-sugeridas",
        "/temas"
    ].some(x => pathname.startsWith(x))

    const isTrendingTopicsPath = ![
        "/temas"
    ].some(x => pathname.startsWith(x))
    const inSearchPage = pathname.startsWith("/buscar") || pathname.startsWith("/temas")

    if(!layoutConfig.openRightPanel){
        return <div className={"flex flex-col pr-6 space-y-6 pt-2"}>
            {searching && !inSearchPage && <div className={"w-[276px]"}>
                <UserSearchResultsOnRightPanel
                    showSearchButton={showSearchButton}
                    handleSubmit={handleSubmit}
                />
            </div>}
        </div>
    }

    return <div className={"flex flex-col pr-6 space-y-6 pt-2"}>

        {searching && !inSearchPage && <div className={"w-[276px]"}>
            <UserSearchResultsOnRightPanel
                showSearchButton={showSearchButton}
                handleSubmit={handleSubmit}
            />
        </div>}

        <div className={"flex justify-center mt-4"}>
            <Logo width={32} height={32}/>
        </div>

        {pathname.includes("inicio") && meetingData && meetingData.show ?
            <div className={"bg-[var(--background-dark)] rounded-lg p-2 text-sm"}>
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
            </div> : null}

        {isTrendingTopicsPath && <TrendingTopicsPanel/>}

        {isFollowSuggestionsPath && user && <FollowSuggestions/>}

        <div className={"flex"}>
            <Link href={"/aportar"}>
                <Button
                    fullWidth={false}
                    startIcon={<DonateIcon/>}
                    size="small"
                    variant={"outlined"}
                >
                    <span className={"font-semibold uppercase"}>
                        Aportar
                    </span>
                </Button>
            </Link>
        </div>

        <div className={"text-sm mt-4 pb-8"}>
            <RightPanelButtons/>
        </div>
    </div>
}