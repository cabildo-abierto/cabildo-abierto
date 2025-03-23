import {SearchPanelOnRightColumn} from "./search-panel-on-right-column";
import {SupportButton} from "./sidebar";
import {CustomLink as Link} from "../ui-utils/custom-link";
import {BasicButton} from "../ui-utils/basic-button";
import InfoIcon from "@mui/icons-material/Info";
import {DonateIcon} from "../icons/donate-icon";
import React from "react";
import {useUser} from "../../hooks/user";
import {UpdateCongresoRightPanel} from "../congreso/update-congreso-right-panel";
import {TrendingTopicsPanel} from "../trending-topics/trending-topics";
import SettingsIcon from "../icons/settings-icon";
import {topicUrl} from "../utils/uri";
import {usePathname} from "next/navigation";


export const RightPanel = () => {
    const {user} = useUser()
    const pathname = usePathname();
    const inSearchPage = pathname.startsWith("/buscar") || pathname.startsWith("/temas");

    return <div className={"fixed top-0 right-0 left-auto h-screen overflow-y-clip"}>
        <div className={"mr-10 " + (inSearchPage ? " mt-16" : "")}>
            {!inSearchPage && <SearchPanelOnRightColumn/>}

            <div className={"max-w-[300px] mt-4 ml-8"}>
                <UpdateCongresoRightPanel/>
            </div>

            <div className={"ml-8 mt-4 flex justify-center w-full max-w-[300px]"}>
                <TrendingTopicsPanel selected={"7days"}/>
            </div>

            <div className={"ml-8 mt-4 w-full max-w-[300px] flex flex-col space-y-1"}>
                <SupportButton user={user} onClose={() => {}}/>
                <Link href={topicUrl("Cabildo Abierto")} className={"text-[var(--text-light)]"}>
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
                {(user.platformAdmin) && <Link href={"/admin"} className={"text-[var(--text-light)]"}>
                    <BasicButton
                        variant={"text"}
                        size={"small"}
                        color={"inherit"}
                        startIcon={<SettingsIcon fontSize={"small"}/>}
                    >
                        Admin
                    </BasicButton>
                </Link>}
            </div>
        </div>
    </div>
}