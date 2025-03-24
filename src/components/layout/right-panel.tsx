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

    return <div className={"flex flex-col pr-6 space-y-6 " + (inSearchPage ? " mt-16" : "")}>
        {!inSearchPage && <SearchPanelOnRightColumn/>}

        <UpdateCongresoRightPanel/>

        <div className={"mt-4 flex justify-center w-full"}>
            <TrendingTopicsPanel selected={"7days"}/>
        </div>

        <div className={"mt-4 w-full flex flex-col space-y-1"}>
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
}