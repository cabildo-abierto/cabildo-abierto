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
import { LogoWithName } from "./logo";
import Image from "next/image"


function TopbarLogo() {
    return <div className="hover:bg-[var(--secondary-light)] rounded-lg h-10 py-1 px-2 w-24 flex justify-center items-center">
        <Link href="/">
            <div className="flex items-center">
                <Image
                    src="/cabildo-icono.png"
                    alt="Loading..."
                    width={320}
                    height={320}
                    priority={true}
                    className="w-8 h-8"
                />
                <div className="ml-1 text-xs text-gray-900">
                    <div>Cabildo</div>
                    <div>Abierto</div>
                </div>
            </div>
        </Link>
    </div>
}


function FeedButton() {
    return <Link href="/inicio" className="px-1">
        <button className="topbar-btn">
            <div className="flex pt-1">
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
    return <div className="px-1">
        <button className="topbar-btn"
            onClick={onClick} disabled={disabled}>
        <SearchIcon />
    </button>
    </div>
}


const NotificationsButton = () => {
    const user = useUser()
    return <Link href="/notificaciones" className="hover:bg-[var(--secondary-light)] rounded-lg">
        <div className="p-1">
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
    const router = useRouter()
    const path = usePathname()

    useEffect(() => {
        if (window.innerWidth >= 640) {
            setSearchBarOpen(true)
            setWideScreen(true)
        }
    }, [])
    
    return <div className="flex items-center w-screen justify-between">
        <div className="flex items-center sm:w-72">
            <TopbarLogo/>
            {(!searchBarOpen || wideScreen) && <OpenSidebarButton onClick={onOpenSidebar}/>}
            {(!searchBarOpen || wideScreen) && <FeedButton />}
            {(!searchBarOpen || wideScreen) && <WriteButton />}
            {!searchBarOpen && path.includes("/inicio") && <SearchButton onClick={() => {
                if(path.includes("/inicio"))
                    setSearchBarOpen(true)
                else
                    router.push("/inicio")
            }} />}
            {(!searchBarOpen || wideScreen) && <NotificationsButton/>}
        </div>

        {searchBarOpen && path.includes("/inicio") && <div className="mx-2">
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
        <div className="flex w-screen justify-end px-2">
            <Link href="/" className="auth-btn px-3 py-2">
                Crear cuenta o iniciar sesión
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