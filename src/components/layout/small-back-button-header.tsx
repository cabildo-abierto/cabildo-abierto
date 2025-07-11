"use client"
import {IconButton} from "@/../modules/ui-utils/src/icon-button"
import MenuIcon from "@mui/icons-material/Menu";
import { useLayoutConfig } from "./layout-config-context";


export const SmallBackButtonHeader = ({title}: {title?: string}) => {
    const {layoutConfig, setLayoutConfig} = useLayoutConfig()

    return <div className={"flex space-x-2 items-center w-full pt-1"}>
        <div className={"text-[var(--text-light)]"}>
            <IconButton
                color={"background"}
                onClick={() => {
                    setLayoutConfig({
                        ...layoutConfig,
                        openSidebar: true
                    })
                }}
            >
                <MenuIcon/>
            </IconButton>
        </div>
        <div className={"font-bold text-lg"}>
            {title}
        </div>
    </div>
}