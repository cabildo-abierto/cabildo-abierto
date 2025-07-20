import {SearchPanelOnRightColumn} from "./search-panel-on-right-column";
import React from "react";
import {TrendingTopicsPanel} from "@/components/topics/trending-topics/trending-topics";
import {usePathname} from "next/navigation";
import {RightPanelButtons} from "@/components/layout/right-panel-buttons";
import {emptyChar} from "@/utils/utils";
import {SearchProvider} from "../buscar/search-context";
import {Logo} from "../../../modules/ui-utils/src/logo";
import Link from "next/link";
import { useNextMeeting } from "@/queries/api";
import {formatIsoDate} from "@/utils/dates";


export const RightPanel = () => {
    const pathname = usePathname();
    const inSearchPage = pathname.startsWith("/buscar") || pathname.startsWith("/temas");
    const {data: meetingData} = useNextMeeting()

    return <div className={"flex flex-col pr-6 space-y-6 pt-6"}>
        <div className={"flex justify-center"}>
            <Logo width={32} height={32}/>
        </div>

        {meetingData && meetingData.show && <div className={"bg-[var(--background-dark)] rounded-lg p-2  text-sm"}>
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
        </div>}

        <div className={"min-h-10"}>
            {!inSearchPage ?
                <SearchProvider>
                    <SearchPanelOnRightColumn/>
                </SearchProvider> :
                <>{emptyChar}</>}
        </div>

        <div className={"flex justify-center w-full"}>
            <TrendingTopicsPanel/>
        </div>

        <div className={"text-sm mt-4"}>
            <RightPanelButtons/>
        </div>
    </div>
}