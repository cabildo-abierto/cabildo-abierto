import Link from "next/link"

export const SidebarButton: React.FC<any> = ({text, onClick, icon, href=null, disabled=false}) => {
    return <li>
        <Link href={href} className="" aria-disabled={disabled}>
            <button className="sidebar-button" onClick={onClick}>
                <div className="flex">
                    {icon} <span className="ml-2">{text}</span>
                </div>
            </button>
        </Link>
    </li>
}