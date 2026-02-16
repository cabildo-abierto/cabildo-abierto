import { ReactNode } from "react"
import {BaseButton} from "@/components/utils/base/base-button"
import {useLayoutConfig} from "../layout-config-context";
import {useLoginModal} from "../../../auth/login-modal-provider";
import {useSession} from "@/components/auth/use-session";
import Link from "next/link";
import {cn} from "@/lib/utils";
import {useLayoutState} from "@/components/layout/main-layout/layout-state-context";


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
    requiresAuth = false
}: SidebarButtonProps) => {
    const {layoutConfig, isMobile} = useLayoutConfig()
    const {layoutState, setLayoutState} = useLayoutState()
    const {setLoginModalOpen} = useLoginModal()
    const {user} = useSession()

    function handleClick(e){
        if(requiresAuth && !user) {
            setLoginModalOpen(true)
        } else {
            if(!layoutConfig.spaceForLeftSide) {
                setLayoutState({
                    ...layoutState,
                    openSidebar: false
                })
            }
        }
        onClick()
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
            <BaseButton
                variant={"default"}
                size="large"
                className={cn("flex py-0 text-[15px] [&_svg]:size-6", showText ? "justify-start px-4 " : "justify-center px-2", showText && isMobile ? "w-full" : "")}
                onClick={handleClick}
                disabled={disabled}
            >
                <div className={"flex items-center space-x-2 [@media(min-height:600px)]:py-2 [@media(min-height:520px)]:py-[6px] [@media(min-height:440px)]:py-[2px] py-0 " + (isMobile ? "text-lg" : "text-sm")}
                >
                    {selected || !iconInactive ? icon : iconInactive}
                    {showText && <div
                    className={selected ? "font-bold" : "font-light"}>
                        {text}
                    </div>}
                </div>
            </BaseButton>
        </Link>
    </div>
}
