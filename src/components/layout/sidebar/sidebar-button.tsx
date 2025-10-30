import { ReactNode } from "react"
import { BaseButton } from "../base/baseButton"
import {useLayoutConfig} from "@/components/layout/layout-config-context";
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
                variant="default"
                size="large"
                className={"flex py-0 text-[15px] [&_svg]:size-6 " + (showText ? " justify-start px-4 " : " justify-center px-2 ") + (showText && isMobile ? "w-full" : "")}
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
