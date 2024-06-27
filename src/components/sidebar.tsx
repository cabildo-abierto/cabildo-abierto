"use client"

import Link from "next/link";
import React, { useState } from "react";
import {getUser} from "@/actions/get-user";
import {logout} from "@/actions/auth";

import Popup from 'reactjs-popup'; 
import EntityPopup from "@/app/entidad/entity-popup";


function FeedButton() {
    return <li className="mb-8 mt-4 text-l font-bold text-gray-900 px-1">
        <Link href={"/profile/cabildoabierto"} className="py-2 px-2 cursor-pointer hover:bg-gray-300 rounded-lg">
            Cabildo Abierto
        </Link>
    </li>
}


const SidebarButton: React.FC<{text: string, href?: string, onClick?: any}> = ({text, href = null, onClick = null}) => {
    const list_item = <li className="mb-4 rounded-lg hover:bg-gray-200 transition duration-100 cursor-pointer px-2">
        <div className="px-1 py-2">
            {text}
        </div>
    </li>
    if(href){
        console.log("Creando link a " + href)
        return <Link href={href} className="text-semibold">
            {list_item}
        </Link>
    } else {
        console.log("Creando un botón")
        return <button className="text-semibold" onClick={onClick}>
            {list_item}
        </button>
    }
}


export default function Sidebar({user}) {
    const [showPopup, setShowPopup] = useState(false)


    const perfil_href: string = "/profile/" + user?.id

    return <div className="h-screen flex flex-col mr-4">
    <ul className="flex-1 mt-4">
        <FeedButton/>
        <SidebarButton text="Inicio" href="/feed"/>
        <SidebarButton text="Escribir" href="/escribir"/>
        <SidebarButton text="Buscar" href="/buscar"/>
        <SidebarButton text="Wiki" href="/estado"/>
        <SidebarButton text="Crear entidad" onClick={() => {setShowPopup(true)}}/>
    </ul>
    <div className="mt-auto">
        <ul>
            <li className="mb-2">
                <Link href={`/profile/${user?.id}`}
                    className={`inline-block cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 tracking-wide text-lg px-1`}>
                    {user?.name}
                </Link>
            </li>
            <li className="mb-2">
                <form action={logout}>
                    <button
                        className="cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 tracking-wide text-gray-400 px-1">
                        Cerrar sesión
                    </button>
                </form>
            </li>
            </ul>
        </div>
        {showPopup && <EntityPopup onClose={() => {setShowPopup(false)}}/>}
    </div>
}