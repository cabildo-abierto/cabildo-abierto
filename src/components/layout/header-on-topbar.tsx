import {ReactNode} from "react";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {BackButton} from "../../../modules/ui-utils/src/back-button";
import {OpenSidebarButton} from "@/components/layout/open-sidebar-button";

export const HeaderOnTopbar = ({title, border=false, rightSide, backButton, defaultBackHref}: {
    title?: ReactNode,
    rightSide?: ReactNode,
    defaultBackHref?: string
    backButton?: boolean
    border?: boolean
}) => {
    const {layoutConfig, isMobile} = useLayoutConfig()

    return <div
        className={"fixed top-0 z-[1101] h-12 flex items-center justify-between px-2" + (isMobile && border ? " border-b border-[var(--text-lighter)] " : "") + (isMobile ? " w-screen" : "")}
        style={{width: layoutConfig.centerWidth}}
    >
        <div className={"flex items-center space-x-2"}>
            {backButton ? <BackButton
            defaultURL={defaultBackHref}
            preferReferrer={false}
            size={"medium"}
            /> : isMobile ? <OpenSidebarButton/> : null
            }
        <div className={"font-bold text-lg"}>
            {title}
        </div>
        </div>
        {rightSide}

    </div>
}