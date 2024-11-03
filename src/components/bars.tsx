"use client"

import React, { useState } from "react";
import { useSearch } from "./search-context";
import Sidebar from "./sidebar";
import Topbar from "./top-bar";

const Bars: React.FC = () => {
    const [openSidebar, setOpenSidebar] = useState(false);
    return (
        <div className="">
            <Topbar onOpenSidebar={() => setOpenSidebar(true)}/>
            {openSidebar && <Sidebar onClose={() => setOpenSidebar(false)} />}
        </div>
    );
};

export default Bars;
