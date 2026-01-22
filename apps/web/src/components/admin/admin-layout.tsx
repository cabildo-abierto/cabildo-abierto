"use client"
import {ReactNode} from "react";
import {AdminProtected} from "../layout/main-layout/admin-protected";
import Link from "next/link";
import {cn} from "@/lib/utils";
import {usePathname} from "next/navigation";
import {useAdminNotificationCounts} from "@/queries/getters/admin";


export const AdminLayout = ({children}: { children: ReactNode }) => {
    const options = ["post", "acceso", "sync", "validacion", "trabajos", "remuneraciones", "stats", "wiki", "UI", "feed", "emails", "worker", "visualizaciones", "moderacion"]
    const pathname = usePathname()
    const {data: notificationCounts} = useAdminNotificationCounts()

    const showNotificationDot = (option: string) => {
        if (!notificationCounts) return false
        if (option === "acceso" && notificationCounts.unsentAccessRequests > 0) return true
        if (option === "validacion" && notificationCounts.pendingValidationRequests > 0) return true
        if (option === "trabajos" && notificationCounts.unseenJobApplications > 0) return true
        return false
    }

    return <AdminProtected>
        <div>
            <div className={"flex flex-wrap gap-2 p-4"}>
                {options.map(o => {
                    return <div key={o} className="relative">
                        <Link
                            href={`/admin/${o.toLowerCase()}`}
                            className={cn("border px-2 py-1 text-sm hover:bg-[var(--background-dark)] capitalize", pathname.includes(o.toLowerCase()) && "bg-[var(--background-dark)]")}
                        >
                            {o}
                        </Link>
                        {showNotificationDot(o) && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
                        )}
                    </div>
                })}
            </div>
            {children}
        </div>
    </AdminProtected>
}