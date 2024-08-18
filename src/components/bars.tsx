"use client"

import { useState } from "react";
import Sidebar from "./sidebar";
import Topbar from "./top-bar";
import SearchSidebar from "./search-sidebar";


export default function Bars() {
    const [openSidebar, setOpenSidebar] = useState(false)
    const [searchValue, setSearchValue] = useState("")
    const searching = searchValue.length > 0

    return <>
        <Topbar onOpenSidebar={() => setOpenSidebar(true)}
                setSearchValue={setSearchValue}
                searching={searching}
        />
        {openSidebar && <Sidebar onClose={() => {setOpenSidebar(false)}}/>}
        {searching && 
            <SearchSidebar searchValue={searchValue}/>
        }
    </>
}