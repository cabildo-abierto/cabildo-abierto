"use client"

import Link from "next/link";
import React, { useState } from "react";
import {logout} from "@/actions/auth";
import EntityPopup from "@/app/entidad/entity-popup";


function FeedButton() {
    return <li className="mb-8 mt-4 text-l font-bold text-gray-900 px-1">
        <Link href={"/profile/cabildoabierto"} className="py-2 px-2 cursor-pointer hover:bg-gray-300 rounded-lg">
            Cabildo Abierto
        </Link>
    </li>
}


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
            <SidebarButton text="Inicio" href="/feed"/>
            <SidebarButton text="Escribir" href="/escribir"/>
            <SidebarButton text="Buscar" href="/buscar"/>
            <SidebarButton text="Wiki" href="/wiki"/>
            <EntityPopup/>
        </ul>
    </div>
}