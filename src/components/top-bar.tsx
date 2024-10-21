"use client"

import Link from "next/link";
import React, { useEffect, useState } from "react";
import SearchBar from "./searchbar";
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import WriteButton from "./write-button";
import { createPortal } from "react-dom";
import { CabildoIcon, NotificationsIcon } from "./icons";
import { useUser } from "../app/hooks/user";
import { TopbarLogo } from "./logo";
import { validSubscription } from "./utils";
import { NotificationsButton } from "./notifications-button";


function FeedButton() {
    return <Link href="/inicio" className="px-1">
        <button className="hover:bg-[var(--secondary-light)] rounded-lg px-1">
            <div className="flex py-1 mt-1">
                <CabildoIcon/>
            </div>
        </button>
    </Link>
}


function OpenSidebarButton({ onClick }: any) {
    return <div className="px-1">
        <button className="topbar-btn" onClick={onClick}>
            <MenuIcon />
        </button>
    </div>
}


export const SearchButton = ({ onClick=null, disabled=false }: any) => {
    return <div className="p-1">
        <button className={!disabled ? "p-1 hover:bg-[var(--secondary-light)] rounded-lg " : ""}
            onClick={onClick} disabled={disabled}>
        <SearchIcon />
    </button>
    </div>
}


type TopbarLoggedInProps = {
    onOpenSidebar: () => void,
    setSearchValue: (arg0: string) => void
}

function TopbarLoggedIn({ onOpenSidebar, setSearchValue }: TopbarLoggedInProps) {
    const [searchBarOpen, setSearchBarOpen] = useState(false)
    const [wideScreen, setWideScreen] = useState(false)
    const user = useUser()

    useEffect(() => {
        if (window.innerWidth >= 640) {
            setSearchBarOpen(true)
            setWideScreen(true)
        }
    }, [])

    const searchBarAvailable = !user.user || validSubscription(user.user)
    
    return <div className="flex items-center w-screen justify-between">
        <div className="flex items-center sm:w-72 text-gray-900">
            {((!searchBarOpen && user.user) || wideScreen) && <TopbarLogo/>}
            {(!searchBarOpen || wideScreen) && <OpenSidebarButton onClick={onOpenSidebar}/>}
            {(!searchBarOpen || wideScreen) && <FeedButton />}
            {((!searchBarOpen && user.user) || wideScreen) && <WriteButton />}
            {!searchBarOpen && <SearchButton onClick={() => {
                setSearchBarOpen(true)
            }} />}
            {(user.user && (!searchBarOpen || wideScreen)) && <NotificationsButton/>}
        </div>

        {searchBarOpen && searchBarAvailable && <div className="mx-2">
            <SearchBar 
                onClose={() => {setSearchBarOpen(false)}}
                setSearchValue={ setSearchValue }
                wideScreen={wideScreen}
            />
        </div>}
        {(user.isLoading || user.user) && 
            <div className="sm:w-72 sm:block hidden"></div>
        }
        {(!user.isLoading && !user.user && (wideScreen || !searchBarOpen)) &&
            <Link href="/" className="sm:w-72 flex justify-end">
                <button className="mr-2 bg-[var(--primary)] px-2 py-1 hover:bg-[var(--primary-dark)] rounded text-[var(--background)] text-xs lg:text-base">
                    Crear cuenta o iniciar sesión
                </button>
            </Link>
        }
    </div>
}

type TopBarProps = {
    onOpenSidebar: () => void, 
    setSearchValue: (arg0: string) => void,
    searching: boolean
}

export default function Topbar({ onOpenSidebar, setSearchValue, searching }: TopBarProps) {
    const [barState, setBarState] = useState("top")
    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const user = useUser()
    
    useEffect(() => {
        const handleScroll = (e) => {
            const currentScrollPos = window.scrollY;
            const scrollUp = currentScrollPos < prevScrollPos
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

    function onSearchUpdate() {
        const currentScrollPos = window.pageYOffset;
        if(currentScrollPos == 0){
            setBarState("top")
        } else {
            setBarState("no bar")
        }
    }

    let bar = <></>
    if(!user.isLoading){
        bar = <TopbarLoggedIn
            onOpenSidebar={onOpenSidebar}
            setSearchValue={(value: string) => {setSearchValue(value); onSearchUpdate()}}
        />
    }

    return createPortal(
        <>
            {(barState != "no bar" || searching) && 
                <div className="fixed top-0 left-0 w-screen">
                    <div className={"topbar-container"+((barState == "transparent" && !searching) ? "-transparent" : "")}>
                        {bar}
                    </div>
                </div>
            }
        </>, 
        document.body
    )
}