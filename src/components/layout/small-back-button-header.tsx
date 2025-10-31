"use client"
import {BaseIconButton} from "@/components/layout/base/base-icon-button"
import { useLayoutConfig } from "./layout-config-context";
import {MenuIcon} from "lucide-react";


export const SmallBackButtonHeader = ({title}: {title?: string}) => {
    const {layoutConfig, setLayoutConfig} = useLayoutConfig()

    return <div className={"flex space-x-2 items-center w-full pt-1"}>
        <div className={"text-[var(--text-light)]"}>
            <BaseIconButton
                onClick={() => {
                    setLayoutConfig({
                        ...layoutConfig,
                        openSidebar: true
                    })
                }}
            >
                <MenuIcon/>
            </BaseIconButton>
        </div>
        <div className={"font-bold text-lg"}>
            {title}
        </div>
    </div>
}