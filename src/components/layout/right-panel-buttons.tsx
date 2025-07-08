import {ReactNode} from "react";
import {CustomLink as Link} from "../../../modules/ui-utils/src/custom-link";
import {topicUrl} from "@/utils/uri";
import InfoIcon from "@mui/icons-material/Info";
import DonateIcon from "@/components/icons/donate-icon";
import SettingsIcon from "@/components/icons/settings-icon";
import {useSession} from "@/queries/api";
import SupportIcon from "@/components/icons/support-icon";
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import {useLayoutConfig} from "@/components/layout/layout-config-context";

export const RightPanelButton = ({children, icon, href, onClick}: {
    children: ReactNode, icon: ReactNode, href: string, onClick?: () => void
}) => {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={"text-[var(--text-light)] hover:font-bold flex items-center space-x-2 hover:text-[var(--text)] transition duration-200 p-1 rounded-lg"}
        >
            <div className={"w-6"}>
                {icon}
            </div>
            <div>
                {children}
            </div>
        </Link>
    )
}


export const RightPanelButtons = () => {
    const {user} = useSession()
    const {layoutConfig, setLayoutConfig} = useLayoutConfig()

    if(!user) return null

    function handleClick() {
        if(!layoutConfig.spaceForLeftSide && layoutConfig.openSidebar){
            setLayoutConfig({
                ...layoutConfig,
                openSidebar: false
            })
        }
    }


    return <div className={"px-3 w-full flex flex-col space-y-1"}>
        <RightPanelButton
            href={"/aportar"}
            onClick={handleClick}
            icon={<DonateIcon color={"inherit"} fontSize={"small"}/>}
        >
            Aportar
        </RightPanelButton>
        <RightPanelButton
            onClick={handleClick}
            href={topicUrl("Cabildo Abierto", undefined, "normal")}
            icon={<InfoIcon color={"inherit"} fontSize={"small"}/>}
        >
            Acerca de Cabildo Abierto
        </RightPanelButton>
        {user.platformAdmin && <RightPanelButton
            onClick={handleClick}
            href={"/admin"}
            icon={<SettingsIcon color={"inherit"} fontSize={"small"}/>}
        >
            Admin
        </RightPanelButton>}
        <RightPanelButton
            onClick={handleClick}
            href={"/soporte"}
            icon={<SupportIcon color="inherit"/>}
        >
            Soporte
        </RightPanelButton>
        <RightPanelButton
            onClick={handleClick}
            href={topicUrl("Cabildo Abierto: Solicitudes de usuarios", undefined, "normal")}
            icon={<RateReviewOutlinedIcon color={"inherit"} fontSize={"small"}/>}
        >
            Sugerencias
        </RightPanelButton>
    </div>
}