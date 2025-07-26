import { ReactNode } from "react"
import { CustomLink } from "../../../modules/ui-utils/src/custom-link"
import { Button, Color } from "../../../modules/ui-utils/src/button"
import { IconButton } from "../../../modules/ui-utils/src/icon-button"
import {useLayoutConfig} from "@/components/layout/layout-config-context";


type SidebarButtonProps = {
    text: string
    onClick?: () => void
    icon: ReactNode
    iconInactive?: ReactNode
    href: string
    disabled?: boolean
    selected?: boolean
    showText?: boolean
    className?: string
    id?: string
    color?: Color
}

export const SidebarButton = ({
    showText=false,
    text,
    onClick=() => {},
    icon,
    iconInactive,
    href,
    disabled=false,
    selected=false,
    className="mt-1 h-10",
    id,
    color="background-dark"
}: SidebarButtonProps) => {
    const {layoutConfig, setLayoutConfig, isMobile} = useLayoutConfig()

    function handleClick(){
        if(!layoutConfig.spaceForLeftSide) {
            setLayoutConfig({
                ...layoutConfig,
                openSidebar: false
            })
        }
    }

    return <>
        <CustomLink href={href} className={className} id={id} onClick={handleClick}>
            {showText ? <Button
                variant="text"
                color={color}
                size="large"
                sx={{
                    textTransform: 'none',
                    justifyContent: 'flex-start',
                    paddingLeft: 2,
                }}
                onClick={onClick}
                fullWidth
                disabled={disabled}
            >
                <div className={"flex items-center space-x-2 " + (isMobile ? "text-lg" : "text-base")}>
                    {selected || !iconInactive ? icon : iconInactive} <span className={selected ? "font-bold" : ""}>{showText ? text : ""}</span>
                </div>
            </Button> :
            <IconButton
                color={color}
                size={"large"}
                sx={{borderRadius: "16px", padding: "10px"}}
            >
                {selected || !iconInactive ? icon : iconInactive}
            </IconButton>}
        </CustomLink>
    </>
}
