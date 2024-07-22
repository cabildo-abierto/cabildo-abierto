import Link from "next/link"

export const SidebarButton = ({text, href = null, onClick = null, disabled = false}) => {
    const list_item = <li className="mb-4 rounded-lg hover:bg-gray-200 transition duration-100 cursor-pointer px-2">
        <div className="px-1 py-2">
            {text}
        </div>
    </li>
    if(href){
        return <Link href={href} className="w-full">
            {list_item}
        </Link>
    } else {
        return <button disabled={disabled} className="w-full text-left disabled:text-gray-600" onClick={onClick}>
            {list_item}
        </button>
    }
}