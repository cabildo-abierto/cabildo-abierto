import {ReactNode} from "react";
import {CustomLink as Link} from "../../../modules/ui-utils/src/custom-link";
import {topicUrl} from "@/utils/uri";
import InfoIcon from "@mui/icons-material/Info";
import DonateIcon from "@/components/icons/donate-icon";
import SettingsIcon from "@/components/icons/settings-icon";
import {useSession} from "@/queries/useSession";
import SupportIcon from "@/components/icons/support-icon";
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {UserCheckIcon} from "@phosphor-icons/react";
import ShareIcon from '@mui/icons-material/Share';

export const RightPanelButton = ({children, icon, href, onClick}: {
    children: ReactNode, icon: ReactNode, href: string, onClick?: () => void
}) => {
    return (
        <Link
            tag={"link"}
            href={href}
            onClick={onClick}
            className={"text-[var(--text-light)] font-light cursor-pointer hover:text-[var(--text)] flex items-center space-x-2 transition duration-200 p-1 rounded-lg"}
        >
            <div className={"w-6"}>
                {icon}
            </div>
            <div className={"flex w-full"}>
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
            onClick={handleClick}
            href={"/ajustes/compartir"}
            icon={<ShareIcon color={"inherit"} fontSize={"small"}/>}
        >
            Compartir una invitación
        </RightPanelButton>
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
        {!user.validation && <RightPanelButton
            onClick={handleClick}
            href={"/ajustes/solicitar-validacion"}
            icon={<UserCheckIcon color={"var(--text)"} fontSize={20}/>}
        >
            Verificar mi cuenta
        </RightPanelButton>}
    </div>
}