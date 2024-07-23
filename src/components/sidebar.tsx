"use client"
import React from "react";
import EntityPopup from "@/components/entity-popup";
import { SidebarButton } from "./sidebar-button";
import { useUser } from "./user-provider";
import { validSubscription } from "./utils";


export default function Sidebar({onClose}: any) {
    const {user} = useUser()
    const hasValidSubscription = validSubscription(user)

    return <div className ="h-screen w-screen fixed top-0 left-0">
        <div className="flex">
            <div className="h-screen w-64 flex flex-col bg-white border-r z-10">
                <ul className="flex-1 mt-4 px-2">
                    <SidebarButton text="Inicio" href="/inicio"/>
                    <SidebarButton text="Siguiendo" href="/siguiendo"/>
                    <SidebarButton text="Escribir" href="/escribir"/>
                    <SidebarButton text="Wiki" href="/wiki"/>
                    <EntityPopup disabled={!hasValidSubscription}/>
                    <SidebarButton text="Suscripciones" href="/suscripciones"/>
                </ul>
            </div>
            <button
                className="h-screen w-full bg-gray-600 bg-opacity-50 z-10"
                onClick={onClose}
            >
            </button>
        </div>
    </div>
}