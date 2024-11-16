"use client"
import { useNotifications, useUser } from "../app/hooks/user"
import { NotificationsIcon } from "./icons"
import { useState } from "react"
import { NotificationsPanel } from "./notificationsPanel"
import { createPortal } from "react-dom"
import { IconButton } from "@mui/material"


function count(a: any[], filter: (v: any) => boolean){
    let t = 0
    a.forEach((v) => {
        if(filter(v)) t++
    })
    return t
}


export const NotificationsButton = () => {
    const user = useUser()
    const [openNotificationsSidebar, setOpenNotificationsSidebar] = useState(false)
    const {notifications} = useNotifications()

    return <>
        <IconButton
            color="inherit"
            onClick={() => {setOpenNotificationsSidebar(true)}}
        >
            <NotificationsIcon count={!notifications ? 0 : count(notifications, (n) => (!n.viewed))}/>
        </IconButton>
        {openNotificationsSidebar && createPortal(<div
            className="fixed top-0 left-0 w-screen h-screen z-50"
        >
            <div className="flex">
                <div className="sm:w-128 w-screen h-screen bg-[var(--background)] border-r z-50 overflow-y-scroll no-scrollbar">
                    <NotificationsPanel onClose={() => {setOpenNotificationsSidebar(false)}}/>
                </div>
                <button
                    className="h-screen w-full hidden sm:block"
                    onClick={() => {setOpenNotificationsSidebar(false)}}
                >
                </button>
            </div>
        </div>, document.body)}
    </>
}