import Link from "next/link"

export const SidebarButton: React.FC<any> = ({text, onClick, href=null, disabled=false}) => {
    return <li>
        <Link href={href} className="w-full" aria-disabled={disabled}>
            <button className="sidebar-button" onClick={onClick}>
                {text}
            </button>
        </Link>
    </li>
}