"use client"

import React, { ReactNode, useState } from "react";
import { useSearch } from "./search-context";
import Sidebar from "./sidebar";
import Topbar from "./top-bar";
import { useRouter } from "next/navigation";

const Bars: React.FC = () => {
    const { searchValue, setSearchValue } = useSearch();
    const [openSidebar, setOpenSidebar] = useState(false);
    const searching = searchValue.length > 0;
    return (
        <>
            <Topbar onOpenSidebar={() => setOpenSidebar(true)}
                    setSearchValue={setSearchValue}
                    searching={searching}
            />
            {openSidebar && <Sidebar onClose={() => setOpenSidebar(false)} />}
        </>
    );
};

export default Bars;
