"use client"

import { useState } from "react";
import Sidebar from "./sidebar";
import Topbar from "./top-bar";


export default function Bars({user, sidebarWidth}) {
    const [openSidebar, setOpenSidebar] = useState(false)

    return <>
        <Topbar user={user} onOpenSidebar={() => setOpenSidebar(true)}/>
        {openSidebar && <>
            <div className="fixed left-0 top-0 h-screen z-50">
                <div className="flex">
                    <div className="" style={{ width: 200 }}>
                        <Sidebar user={user}/>
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