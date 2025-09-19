import { ReactNode } from "react"
import { CustomLink } from "../../../../modules/ui-utils/src/custom-link"
import { Button } from "../../../../modules/ui-utils/src/button"
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {Color} from "../../../../modules/ui-utils/src/color";


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
    color="transparent"
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
        <CustomLink tag="link" href={href} className={className + (showText ? "" : " pl-2")} id={id} onClick={handleClick}>
            <Button
                variant="text"
                color={color}
                size="large"
                sx={{
                    justifyContent: showText ? "flex-start" : "center",
                    paddingLeft: showText ? 2 : 0,
                    paddingRight: showText ? 2 : 0,
                    minWidth: showText ? undefined : "40px",
                }}
                onClick={onClick}
                fullWidth={showText && isMobile}
                disabled={disabled}
            >
                <div className={"uppercase flex items-center space-x-2 " + (isMobile ? "text-lg" : "text-sm")}>
                    {selected || !iconInactive ? icon : iconInactive}
                    {showText && <div
                    className={selected ? "font-bold" : "font-light"}>
                        {text}
                    </div>}
                </div>
            </Button>
        </CustomLink>
    </>
}
