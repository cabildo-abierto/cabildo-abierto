"use client"

import Link from "next/link";
import React, { useEffect, useState } from "react";
import SearchBar from "./searchbar";
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import CreateIcon from '@mui/icons-material/Create';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';

function FeedButton() {
    return <div className="px-1 py-2">
        <Link href="/inicio">
        <button className="topbar-btn">
            <HomeIcon />
        </button>
        </Link>
    </div>
}

function WriteButton() {
    return <div className="px-1 py-2">
        <Link href="/escribir">
        <button className="topbar-btn">
            <CreateIcon />
        </button>
        </Link>
    </div>
}


function WikiButton() {
    return <div className="px-1 py-2">
        <Link href="/nav">
        <button className="topbar-btn">
            <LocalLibraryIcon />
        </button>
        </Link>
    </div>
}



function OpenSidebarButton({ onClick }: any) {
    return <div className="px-1 py-2">
        <button className="topbar-btn" onClick={onClick}>
            <MenuIcon />
        </button>
    </div>
}


export const SearchButton = ({ onClick=null, disabled=false }: any) => {
    return <div className="px-1 py-2">
        <button className="topbar-btn"
            onClick={onClick} disabled={disabled}>
        <SearchIcon />
    </button>
    </div>
}



function TopbarLoggedIn({ user, onOpenSidebar, onSearchingUpdate, searching, contents }: any) {
    return <div className="flex items-center w-screen">
        <OpenSidebarButton onClick={onOpenSidebar} />
        {!searching &&
            <>
            <FeedButton />
            <WikiButton />
            <WriteButton />
            <SearchButton onClick={onSearchingUpdate} />
            </>
        }

        {searching && 
            <SearchBar contents={contents} user={user} onClose={() => { onSearchingUpdate(false) }} />
        }
    </div>
}


const TopBarGuest = () => {
    return <>
        <div className="w-1/4"></div>
        <div className="text-gray-600 flex justify-center w-1/2">
            {false && <div>
                Estás viendo esta página como invitado
            </div>}
        </div>
        <div className="px-4 w-1/4 flex justify-end">
            <Link href="/">
                <button
                    className="hover:bg-gray-200 rounded cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 text-gray-600 px-2"
                >
                    Crear cuenta o iniciar sesión
                </button>
            </Link>
        </div>
    </>
}


const TopBarLoading = () => {
    return <>
    </>
}


export default function Topbar({ user, onOpenSidebar, contents }: any) {
    const [barState, setBarState] = useState("top")
    const [searching, setSearching] = useState(false)
    const [prevScrollPos, setPrevScrollPos] = useState(0);
    
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

    function handleSearchingUpdate(value: any) {
        setSearching(value)
        const currentScrollPos = window.pageYOffset;
        if(currentScrollPos == 0){
            setBarState("top")
        } else {
            setBarState("no bar")
        }
    }

    let bar = <></>
    if(user === null){
        bar = <TopBarGuest/>
    } else if(user === undefined){
        bar = <TopBarLoading/>
    } else {
        bar = <TopbarLoggedIn
            user={user}
            onOpenSidebar={onOpenSidebar}
            onSearchingUpdate={handleSearchingUpdate}
            searching={searching}
            contents={contents}
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