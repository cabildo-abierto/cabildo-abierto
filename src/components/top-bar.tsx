"use client"

import Link from "next/link";
import React, { useEffect, useState } from "react";
import SearchBar from "./searchbar";
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import WriteButton from "./write-button";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { CabildoIcon } from "./icons";
import { useUser } from "../app/hooks/user";

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
        <div className="flex items-center sm:w-32 w-16">
            <OpenSidebarButton onClick={onOpenSidebar}/>
            {(!searchBarOpen || wideScreen) && <FeedButton />}
            {(!searchBarOpen || wideScreen) && <WriteButton />}
            {!searchBarOpen && path.includes("/inicio") && <SearchButton onClick={() => {
                if(path.includes("/inicio"))
                    setSearchBarOpen(true)
                else
                    router.push("/inicio")
            }} />}
        </div>

        {searchBarOpen && path.includes("/inicio") && <div className="">
            <SearchBar 
                onClose={() => {setSearchBarOpen(false)}}
                setSearchValue={ setSearchValue }
                wideScreen={wideScreen}
            />
        </div>}
        <div className="sm:w-32 w-16"></div>
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
                    className="auth-btn px-3 py-2"
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