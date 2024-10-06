"use client"

import Link from "next/link";
import React, { useEffect, useState } from "react";
import SearchBar from "./searchbar";
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import WriteButton from "./write-button";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { CabildoIcon, NotificationsIcon } from "./icons";
import { useUser } from "../app/hooks/user";
import { TopbarLogo } from "./logo";


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


const NotificationsButton = () => {
    const user = useUser()
    return <Link href="/notificaciones" className="hover:bg-[var(--secondary-light)] rounded-lg">
        <div className="px-1 py-[5px]">
            <NotificationsIcon count={user.user ? user.user._count.notifications : undefined}/>
        </div>
    </Link>
}


type TopbarLoggedInProps = {
    onOpenSidebar: () => void,
    setSearchValue: (arg0: string) => void
}

function TopbarLoggedIn({ onOpenSidebar, setSearchValue }: TopbarLoggedInProps) {
    const [searchBarOpen, setSearchBarOpen] = useState(false)
    const [wideScreen, setWideScreen] = useState(false)

    useEffect(() => {
        if (window.innerWidth >= 640) {
            setSearchBarOpen(true)
            setWideScreen(true)
        }
    }, [])
    
    return <div className="flex items-center w-screen justify-between">
        <div className="flex items-center sm:w-72 text-gray-900">
            <TopbarLogo/>
            {(!searchBarOpen || wideScreen) && <OpenSidebarButton onClick={onOpenSidebar}/>}
            {(!searchBarOpen || wideScreen) && <FeedButton />}
            {(!searchBarOpen || wideScreen) && <WriteButton />}
            {!searchBarOpen && <SearchButton onClick={() => {
                setSearchBarOpen(true)
            }} />}
            {(!searchBarOpen || wideScreen) && <NotificationsButton/>}
        </div>

        {searchBarOpen && <div className="mx-2">
            <SearchBar 
                onClose={() => {setSearchBarOpen(false)}}
                setSearchValue={ setSearchValue }
                wideScreen={wideScreen}
            />
        </div>}
        <div className="sm:w-72 sm:block hidden"></div>
    </div>
}


const TopBarGuest = () => {
    return <>
        <div className="flex w-screen justify-between items-center px-2">
            <TopbarLogo/>
            <Link href="/" className="">
                <button className="gray-btn">
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
        const handleScroll = () => {
            const currentScrollPos = window.pageYOffset;
            const scrollUp = currentScrollPos < prevScrollPos;
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
    if(user.isLoading){
        bar = <TopBarLoading/>
    } else if(user.isError || !user.user){
        bar = <TopBarGuest/>
    } else {
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