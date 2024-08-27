import Link from "next/link"
import { ReactNode } from "react"

type SidebarButtonProps = {
    text: string
    onClick: () => void
    icon: ReactNode
    href: string
    disabled?: boolean
}

export const SidebarButton: React.FC<SidebarButtonProps> = ({text, onClick, icon, href, disabled=false}) => {
    return <Link href={href} className="mb-2" aria-disabled={disabled}>
        <button className="sidebar-btn" onClick={onClick}>
            <div className="flex">
                {icon} <span className="ml-2">{text}</span>
            </div>
        </button>
    </Link>
}