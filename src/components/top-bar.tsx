"use client"

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { logout } from "@/actions/auth";
import SearchBar from "./searchbar";
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import { validSubscription } from "./utils";
import { useUser } from "./user-provider";


function FeedButton() {
    return <div className="text-l font-bold text-gray-900 px-1 py-2">
        <Link href={"/wiki/Cabildo_Abierto"} className="py-2 px-2 cursor-pointer hover:bg-gray-300 rounded-lg">
            Cabildo Abierto
        </Link>
    </div>
}

function OpenSidebarButton({ onClick }) {
    return <div className="text-l text-gray-900 px-1 py-2">
        <button className="py-2 px-2 cursor-pointer hover:bg-gray-300 rounded-lg" onClick={onClick}>
            <MenuIcon />
        </button>
    </div>
}


const SearchButton = ({ onClick }) => {
    return <button className="transparent-button round-background" onClick={onClick}>
        <SearchIcon />
    </button>
}


function TopbarLoggedIn({ onOpenSidebar, onSearchingUpdate, searching }) {
    const {user} = useUser()

    return <>
        <div className="flex items-center">
            <OpenSidebarButton onClick={onOpenSidebar} />
            <FeedButton />
        </div>

        <div className="flex items-center">
            {searching && <div className="">
                <SearchBar onClose={() => { onSearchingUpdate(false) }} />
            </div>}
            {!searching && <SearchButton onClick={() => { onSearchingUpdate(true) }} />}

            <div className="px-2">
                <Link href={`/perfil/${user?.id.slice(1)}`}
                    className={`inline-block cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 tracking-wide px-2`}>
                    {user?.name}
                </Link>
            </div>

            <div className="px-2">
                <button
                    className="gray-button"
                    onClick={(e) => { logout() }}
                >
                    Cerrar sesión
                </button>
            </div>
        </div>
    </>
}


const TopBarGuest = () => {
    return <>
        <div className="w-1/4"></div>
        <div className="text-gray-600 flex justify-center w-1/2">
            <div>
                Estás viendo esta página como invitado, muchas funciones no están disponibles.</div>
        </div>
        <div className="px-4 w-1/4 flex justify-end">
            <button
                className="hover:bg-gray-200 rounded cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 text-gray-600 px-2"
                onClick={(e) => { logout() }}
            >
                <Link href="/">
                    Crear cuenta o iniciar sesión
                </Link>
            </button>
        </div>
    </>
}


const TopBarNoSubcription = ({onOpenSidebar}) => {
    const {user} = useUser()

    return <>
        <div className="w-1/4">
            <div className="flex items-center">
                <OpenSidebarButton onClick={onOpenSidebar} />
                <FeedButton />
            </div>
        </div>
        <div className="text-gray-600 flex justify-center w-1/2">
            <div>
                Sin suscripción activa</div>
        </div>
        <div className="px-4 w-1/4 flex justify-end">
            <div className="px-2">
                <Link href={`/perfil/${user?.id.slice(1)}`}
                    className={`inline-block cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 tracking-wide px-2`}>
                    {user?.name}
                </Link>
            </div>

            <div className="px-2">
                <button
                    className="gray-button"
                    onClick={(e) => { logout() }}
                >
                    Cerrar sesión
                </button>
            </div>
        </div>
    </>
}


export default function Topbar({ onOpenSidebar }) {
    const [barState, setBarState] = useState("top")
    const [searching, setSearching] = useState(false)
    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const {user, setUser} = useUser()
    const activeSubscription = validSubscription(user)
    
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollPos = window.pageYOffset;
            const scrollUp = prevScrollPos > currentScrollPos;
            if (currentScrollPos == 0) {
                setBarState("top")
            } else if (scrollUp) {
                setBarState("transparent");
            } else {
                setBarState("no bar");
            }
            setPrevScrollPos(currentScrollPos);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [prevScrollPos]);

    function handleSearchingUpdate(value) {
        setSearching(value)
        const currentScrollPos = window.pageYOffset;
        if(currentScrollPos == 0){
            setBarState("top")
        } else {
            setBarState("no bar")
        }
    }


    let bar = <></>
    if(!user){
        bar = <TopBarGuest/>
    } else if(!activeSubscription){
        bar = <TopBarNoSubcription
            onOpenSidebar={onOpenSidebar}
        />
    } else {
        bar = <TopbarLoggedIn 
            onOpenSidebar={onOpenSidebar}
            onSearchingUpdate={handleSearchingUpdate}
            searching={searching}
        />
    }

    return <><div className="border-b z-1 bg-white h-16 flex items-center justify-between">
            {bar}
        </div>
        {(barState != "no bar" || searching) && <div className="fixed top-0 left-0 w-screen">
            <div className={"border-b z-1 bg-white h-16 flex items-center justify-between w-full"+((barState == "transparent" && !searching) ? " bg-opacity-50" : "")}>
                {bar}
            </div>
        </div>}
    </>
}