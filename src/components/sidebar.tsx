"use client"
import React from "react";
import EntityPopup from "@/app/wiki/entity-popup";
import { SidebarButton } from "./sidebar-button";
import { useUser } from "./user-provider";
import { validSubscription } from "./utils";


export default function Sidebar() {
    const {user} = useUser()
    const hasValidSubscription = validSubscription(user)

    return <div className="h-screen flex flex-col px-2 bg-white z-50 border-r">
        <ul className="flex-1 mt-4">
            <SidebarButton text="Inicio" href="/inicio"/>
            <SidebarButton text="Siguiendo" href="/siguiendo"/>
            <SidebarButton text="Escribir" href="/escribir"/>
            <SidebarButton text="Wiki" href="/wiki"/>
            <EntityPopup disabled={!hasValidSubscription}/>
            <SidebarButton text="Suscripciones" href="/suscripciones"/>
        </ul>
    </div>
}