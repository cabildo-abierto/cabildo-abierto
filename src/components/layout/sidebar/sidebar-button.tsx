import { ReactNode } from "react"
import { Button } from "../utils/button"
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {Color} from "../utils/color";
import {useLoginModal} from "@/components/layout/login-modal-provider";
import {useSession} from "@/queries/getters/useSession";
import Link from "next/link";


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
    requiresAuth?: boolean
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
    color="transparent",
    requiresAuth = false
}: SidebarButtonProps) => {
    const {layoutConfig, setLayoutConfig, isMobile} = useLayoutConfig()
    const {setLoginModalOpen} = useLoginModal()
    const {user} = useSession()

    function handleClick(e){
        if(requiresAuth && !user) {
            setLoginModalOpen(true)
        } else {
            if(!layoutConfig.spaceForLeftSide) {
                setLayoutConfig({
                    ...layoutConfig,
                    openSidebar: false
                })
            }
        }
    }

    return <div
        id={id}
        className={className + "  "  + (showText ? "" : " pl-2")}
    >
        <Link
            href={href}
            onClick={e => {
                if(requiresAuth && !user) {
                    e.preventDefault()
                }
            }}
        >
            <Button
                variant="text"
                color={color}
                size="large"
                sx={{
                    justifyContent: showText ? "flex-start" : "center",
                    paddingLeft: showText ? 2 : 0,
                    paddingRight: showText ? 2 : 0,
                    minWidth: showText ? undefined : "40px",
                    paddingY: "0px"
                }}
                onClick={handleClick}
                fullWidth={showText && isMobile}
                disabled={disabled}
            >
                <div className={"uppercase flex items-center space-x-2 [@media(min-height:600px)]:py-2 [@media(min-height:520px)]:py-[6px] [@media(min-height:440px)]:py-[2px] py-0" + (isMobile ? "text-lg" : "text-sm")}>
                    {selected || !iconInactive ? icon : iconInactive}
                    {showText && <div
                    className={selected ? "font-bold" : "font-light"}>
                        {text}
                    </div>}
                </div>
            </Button>
        </Link>
    </div>
}
