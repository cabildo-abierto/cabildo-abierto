import Link from "next/link";
import React from "react";
import EntityPopup from "@/app/wiki/entity-popup";


export const SidebarButton: React.FC<{text: string, href?: string, onClick?: any}> = ({text, href = null, onClick = null}) => {
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
        return <button className="w-full text-left" onClick={onClick}>
            {list_item}
        </button>
    }
}


export default function Sidebar({user}) {

    return <div className="h-screen flex flex-col px-2 bg-white z-50 border-r">
        <ul className="flex-1 mt-4">
            <SidebarButton text="Inicio" href="/inicio"/>
            <SidebarButton text="Siguiendo" href="/siguiendo"/>
            <SidebarButton text="Escribir" href="/escribir"/>
            <SidebarButton text="Wiki" href="/wiki"/>
            <EntityPopup/>
            <SidebarButton text="Suscripciones" href="/suscripciones"/>
        </ul>
    </div>
}