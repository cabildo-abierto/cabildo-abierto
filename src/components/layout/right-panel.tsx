import {SearchPanelOnRightColumn} from "./search-panel-on-right-column";
import React from "react";
import {UpdateCongresoRightPanel} from "../congreso/update-congreso-right-panel";
import {TrendingTopicsPanel} from "@/components/topics/trending-topics/trending-topics";
import {usePathname} from "next/navigation";
import {RightPanelButtons} from "@/components/layout/right-panel-buttons";
import {emptyChar} from "@/utils/utils";


export const RightPanel = () => {
    const pathname = usePathname();
    const inSearchPage = pathname.startsWith("/buscar") || pathname.startsWith("/temas");

    return <div className={"flex flex-col pr-6 space-y-4 pt-4"}>
        <div className={"min-h-10"}>
            {!inSearchPage ? <SearchPanelOnRightColumn/> : <>{emptyChar}</>}
        </div>

        <UpdateCongresoRightPanel/>

        <div className={"flex justify-center w-full"}>
            <TrendingTopicsPanel/>
        </div>

        <RightPanelButtons/>
    </div>
}