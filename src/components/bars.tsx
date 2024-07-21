"use client"

import { useState } from "react";
import Sidebar from "./sidebar";
import Topbar from "./top-bar";


export default function Bars() {
    const [openSidebar, setOpenSidebar] = useState(false)

    return <>
        <Topbar onOpenSidebar={() => setOpenSidebar(true)}/>
        {openSidebar && <>
            <div className="fixed left-0 top-0 h-screen z-50">
                <div className="flex">
                    <div className="" style={{ width: 200 }}>
                        <Sidebar/>
                    </div>
                </div>
            </div>
            <button
                className="fixed left-0 top-0 h-screen w-screen bg-gray-600 bg-opacity-50 z-10"
                onClick={() => {setOpenSidebar(false)}}
            >
            </button>
            </>
        }
    </>
}