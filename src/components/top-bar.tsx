"use client"

import { CustomLink as Link } from './custom-link';
import React, { useEffect, useState } from "react";
import SearchBar from "./searchbar";
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import WriteButton from "./write-button";
import { createPortal } from "react-dom";
import { useUser } from "../app/hooks/user";
import { TopbarLogo } from "./logo";
import { NotificationsButton } from "./notifications-button";
import { useSearch } from "./search-context";
import { Button, IconButton } from "@mui/material";
import { CabildoIcon } from './icons/home-icon';


function FeedButton() {
    return <Link href="/inicio" className="">
        <IconButton color="inherit">
            <CabildoIcon/>
        </IconButton>
    </Link>
}


function OpenSidebarButton({ onClick }: any) {
    return <IconButton color="inherit" onClick={onClick}>
        <MenuIcon />
    </IconButton>
}


export const SearchButton = ({ onClick, disabled=false }: {onClick?: () => void, disabled?: boolean}) => {
    return <IconButton
            onClick={onClick}
            disabled={disabled}
            color="inherit"
            size="small"
        >
            <SearchIcon />
    </IconButton>
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

    const searchBarAvailable = true
    
    return <div className="flex items-center w-screen justify-between">
        <div className="flex items-center sm:w-72 text-gray-900">
            {((!searchBarOpen && user.user) || wideScreen) && <div className="ml-1"><TopbarLogo somethingSpecial={false}/></div>}
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
                wideScreen={wideScreen}
            />
        </div>}
        {(user.isLoading || user.user) && 
            <div className="sm:w-72 sm:block hidden"></div>
        }
        {(!user.isLoading && !user.user && (wideScreen || !searchBarOpen)) &&
            <div className="sm:w-72 flex justify-end">
                <Link href="/" className="mx-1 sm:mx-2">
                <Button
                    size="small"
                    variant="contained"
                    sx={{
                        textTransform: "none",
                        display: "flex",
                        flexDirection: "column",
                        lineHeight: 1.2,
                        gap: "2px",
                    }}
                    disableElevation={true}
                >
                    <span>Crear cuenta o </span><span>iniciar sesión</span>
                </Button>
                </Link>
            </div>
        }
    </div>
}

type TopBarProps = {
    onOpenSidebar: () => void, 
}

export default function Topbar({ onOpenSidebar }: TopBarProps) {
    const [barState, setBarState] = useState("top")
    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const {searchState, setSearchState} = useSearch()
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
            setSearchValue={(value: string) => {setSearchState({value: value, ...searchState}); onSearchUpdate()}}
        />
    }

    return createPortal(
        <>
            {(barState != "no bar" || searchState.searching) && 
                <div className="fixed top-0 left-0 w-screen">
                    <div className={"topbar-container"+((barState == "transparent" && !searchState.searching) ? "-transparent" : "")}>
                        {bar}
                    </div>
                </div>
            }
        </>, 
        document.body
    )
}