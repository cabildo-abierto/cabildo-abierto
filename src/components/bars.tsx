"use client"

import { useState } from "react";
import Sidebar from "./sidebar";
import Topbar from "./top-bar";
import { UserProps } from "@/actions/get-user";


export default function Bars() {
    const [openSidebar, setOpenSidebar] = useState(false)

    return <>
        <Topbar onOpenSidebar={() => setOpenSidebar(true)}/>
        {openSidebar && <Sidebar onClose={() => {setOpenSidebar(false)}}/>}
    </>
}