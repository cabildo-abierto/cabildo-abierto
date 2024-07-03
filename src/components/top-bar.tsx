"use client"

import Link from "next/link";
import React, { useState } from "react";
import {logout} from "@/actions/auth";
import EntityPopup from "@/app/entidad/entity-popup";


function FeedButton() {
    return <div className="text-l font-bold text-gray-900 px-1 py-2">
        <Link href={"/profile/cabildoabierto"} className="py-2 px-2 cursor-pointer hover:bg-gray-300 rounded-lg">
            Cabildo Abierto
        </Link>
    </div>
}

function OpenSidebarButton({onClick}) {
    return <div className="text-l text-gray-900 px-1 py-2">
        <button className="py-2 px-2 cursor-pointer hover:bg-gray-300 rounded-lg" onClick={onClick}>
            =
        </button>
    </div>
}


export default function Topbar({user, onOpenSidebar}) {

    return <div className="border-b z-1 bg-white">
        <div className="flex justify-between">
            <div className="flex items-center">
                <OpenSidebarButton onClick={onOpenSidebar}/>
                <FeedButton/>
            </div>

            <div className="flex items-center px-2">
                <div className="px-2">
                    <Link href={`/profile/${user?.id}`}
                        className={`inline-block cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 tracking-wide px-2`}>
                        {user?.name}
                    </Link>
                </div>
                <div className="px-2">
                    <button
                        className="hover:bg-gray-200 rounded cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 tracking-wide text-gray-400 px-2"
                        onClick={(e) => {logout()}}
                    >
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </div>
    </div>
}