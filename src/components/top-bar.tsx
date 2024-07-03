"use client"

import Link from "next/link";
import React, { useState } from "react";
import {logout} from "@/actions/auth";
import EntityPopup from "@/app/entidad/entity-popup";
import SearchBar from "./searchbar";
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';


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
            <MenuIcon/>
        </button>
    </div>
}


const SearchButton = ({onClick}) => {
    return <button className="transparent-button round-background" onClick={onClick}>
        <SearchIcon/>
    </button>
}


export default function Topbar({user, onOpenSidebar}) {
    const [searching, setSearching] = useState(false)

    return <div className="border-b z-1 bg-white h-16 flex justify-between items-center">
        
        <div className="flex items-center">
            <OpenSidebarButton onClick={onOpenSidebar}/>
            <FeedButton/>
        </div>

        {searching && <div className="">
            <SearchBar onClose={() => {setSearching(false)}}/>
        </div>}
        
        <div className="flex items-center">
            {!searching && <SearchButton onClick={() => {setSearching(true)}}/>}
            
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
}