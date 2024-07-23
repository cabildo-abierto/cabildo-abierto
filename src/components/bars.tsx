"use client"

import { useState } from "react";
import Sidebar from "./sidebar";
import Topbar from "./top-bar";


export default function Bars() {
    const [openSidebar, setOpenSidebar] = useState(false)

    return <>
        <Topbar onOpenSidebar={() => setOpenSidebar(true)}/>
        {openSidebar && <Sidebar onClose={() => {setOpenSidebar(false)}}/>}
    </>
}