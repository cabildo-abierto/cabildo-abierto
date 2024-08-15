"use client"

import { useState } from "react";
import Sidebar from "./sidebar";
import Topbar from "./top-bar";


export default function Bars({user, contents}: any) {
    const [openSidebar, setOpenSidebar] = useState(false)

    return <>
        <Topbar user={user} contents={contents} onOpenSidebar={() => setOpenSidebar(true)}/>
        {openSidebar && <Sidebar user={user} onClose={() => {setOpenSidebar(false)}}/>}
    </>
}