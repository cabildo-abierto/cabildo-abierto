import {SearchPanelOnRightColumn} from "./search-panel-on-right-column";
import React from "react";
import {UpdateCongresoRightPanel} from "../congreso/update-congreso-right-panel";
import {TrendingTopicsPanel} from "@/components/topics/trending-topics/trending-topics";
import {usePathname} from "next/navigation";
import {FooterHorizontalRule} from "../../../modules/ui-utils/src/footer";
import {RightPanelButtons} from "@/components/layout/right-panel-buttons";


export const RightPanel = () => {
    const pathname = usePathname();
    const inSearchPage = pathname.startsWith("/buscar") || pathname.startsWith("/temas");

    return <div className={"flex flex-col pr-6 space-y-6 " + (inSearchPage ? " mt-16" : "")}>
        {!inSearchPage && <SearchPanelOnRightColumn/>}

        <UpdateCongresoRightPanel/>

        <div className={"flex justify-center w-full"}>
            <TrendingTopicsPanel selected={"7days"}/>
        </div>

        <RightPanelButtons/>
    </div>
}