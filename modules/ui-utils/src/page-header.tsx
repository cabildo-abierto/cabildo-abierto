"use client"
import {IconButton} from "./icon-button"
import MenuIcon from "@mui/icons-material/Menu";
import {BackButton} from "./back-button";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {ReactNode} from "react";


export default function PageHeader({title, defaultBackHref = "/", rightSide}: {
    title: string, defaultBackHref?: string, rightSide?: ReactNode
}) {
    const {layoutConfig, setLayoutConfig} = useLayoutConfig()

    return <div className={"flex items-center justify-between py-2 border-b h-12"}>
        <div className={"flex space-x-2 items-center"}>
            <div className={"w-10 text-[var(--text-light)] min-[500px]:hidden"}>
                <IconButton
                    color={"transparent"}
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
            <div className={"max-[500px]:hidden"}>
                <BackButton defaultURL={defaultBackHref}/>
            </div>
            <div className={"font-bold text-lg"}>
                {title}
            </div>
        </div>
        <div>
            {rightSide}
        </div>
    </div>
}