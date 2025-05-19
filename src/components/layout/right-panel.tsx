import {SearchPanelOnRightColumn} from "./search-panel-on-right-column";
import React from "react";
import {TrendingTopicsPanel} from "@/components/topics/trending-topics/trending-topics";
import {usePathname} from "next/navigation";
import {RightPanelButtons} from "@/components/layout/right-panel-buttons";
import {emptyChar} from "@/utils/utils";
import {SearchProvider} from "../buscar/search-context";
import {Logo} from "../../../modules/ui-utils/src/logo";


export const RightPanel = () => {
    const pathname = usePathname();
    const inSearchPage = pathname.startsWith("/buscar") || pathname.startsWith("/temas");

    return <div className={"flex flex-col pr-6 space-y-6 pt-6"}>
        <div className={"flex justify-center"}>
            <Logo width={32} height={32}/>
        </div>

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

        <RightPanelButtons/>
    </div>
}