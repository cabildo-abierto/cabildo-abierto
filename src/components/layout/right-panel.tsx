import {SearchPanelOnRightColumn} from "./search-panel-on-right-column";
import {TrendingTopicsPanel} from "../trending-topics/trending-topics";
import {SupportButton} from "../sidebar";
import {CustomLink as Link} from "../custom-link";
import {articleUrl} from "../utils";
import {BasicButton} from "../ui-utils/basic-button";
import InfoIcon from "@mui/icons-material/Info";
import {DonateIcon} from "../icons/donate-icon";
import React from "react";
import {useUser} from "../../hooks/user";
import {UpdateCongresoRightPanel} from "../congreso/update-congreso-right-panel";


export const RightPanel = () => {
    const {user} = useUser()

    return <div className={"fixed top-0 right-0 left-auto h-screen overflow-y-scroll"}>
        <div className={"mr-10"}>
            <SearchPanelOnRightColumn/>

            <div className={"max-w-[300px] mt-4 ml-8"}>
                <UpdateCongresoRightPanel/>
            </div>

            <div className={"ml-8 mt-4 flex justify-center w-full max-w-[300px]"}>
                <TrendingTopicsPanel selected={"7days"}/>
            </div>
            <div className={"ml-8 mt-4 w-full max-w-[300px] flex flex-col space-y-1"}>
                <SupportButton user={user} onClose={() => {
                }}/>
                <Link href={articleUrl("Cabildo_Abierto")} className={"text-[var(--text-light)]"}>
                    <BasicButton
                        variant={"text"}
                        size={"small"}
                        color={"inherit"}
                        startIcon={<InfoIcon/>}
                    >
                        Acerca de Cabildo Abierto
                    </BasicButton>
                </Link>
                <Link href={"/aportar"} className={"text-[var(--text-light)]"}>
                    <BasicButton
                        variant={"text"}
                        size={"small"}
                        color={"inherit"}
                        startIcon={<DonateIcon fontSize={"small"}/>}
                    >
                        Aportar
                    </BasicButton>
                </Link>
            </div>
        </div>
    </div>
}