"use client"

import { useState } from "react";
import Sidebar from "./sidebar";
import Topbar from "./top-bar";


export default function Bars({user}: any) {
    const [openSidebar, setOpenSidebar] = useState(false)

    return <>
        <Topbar user={user} onOpenSidebar={() => setOpenSidebar(true)}/>
        {openSidebar && <Sidebar user={user} onClose={() => {setOpenSidebar(false)}}/>}
    </>
}