"use client"
import {IconButton} from "@/../modules/ui-utils/src/icon-button"
import MenuIcon from "@mui/icons-material/Menu";
import {Logo} from "../../../modules/ui-utils/src/logo";
import {emptyChar} from "@/utils/utils";
import {useLayoutConfig} from "./layout-config-context";


export const MobileHeader = () => {
    const {layoutConfig, setLayoutConfig} = useLayoutConfig()

    return <div className={"min-[500px]:hidden flex justify-between items-center w-full px-2"}>
        <div className={"w-10 text-[var(--text-light)]"}>
            <IconButton
                color={"inherit"}
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
        <Logo width={24} height={24}/>
        <div className={"w-10"}>{emptyChar}</div>
    </div>
}