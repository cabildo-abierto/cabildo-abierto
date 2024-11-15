"use client"
import { useNotifications, useUser } from "../app/hooks/user"
import { NotificationsIcon } from "./icons"
import { useState } from "react"
import { NotificationsPanel } from "./notificationsPanel"
import { createPortal } from "react-dom"


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
        <button
            onClick={() => {setOpenNotificationsSidebar(true)}}         className="hover:bg-[var(--secondary-light)] rounded-lg">
            <div className="px-1 py-[5px]">
                <NotificationsIcon count={!notifications ? 0 : count(notifications, (n) => (!n.viewed))}/>
            </div>
        </button>
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