"use client"

import React, { ReactNode, useState } from "react";
import Sidebar from "./sidebar";
import Topbar from "./top-bar";

export const Bars = ({children}: {children: ReactNode}) => {
    const [openSidebar, setOpenSidebar] = useState(false);
    return (
        <>
            <Topbar onOpenSidebar={() => setOpenSidebar(true)}/>
            {openSidebar && <Sidebar onClose={() => setOpenSidebar(false)} />}
            {children}
        </>
    );
};
