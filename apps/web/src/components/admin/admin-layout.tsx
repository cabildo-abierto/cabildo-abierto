"use client"
import {ReactNode} from "react";
import {AdminProtected} from "../layout/main-layout/admin-protected";
import Link from "next/link";
import {cn} from "@/lib/utils";
import {usePathname} from "next/navigation";


export const AdminLayout = ({children}: { children: ReactNode }) => {
    const options = ["post", "acceso", "sync", "validacion", "remuneraciones", "stats", "wiki", "UI", "feed"]
    const pathname = usePathname()

    return <AdminProtected>
        <div>
            <div className={"flex flex-wrap gap-2 p-4"}>
                {options.map(o => {
                    return <div key={o}>
                        <Link
                            href={`/admin/${o.toLowerCase()}`}
                            className={cn("border px-2 py-1 text-sm hover:bg-[var(--background-dark)] capitalize", pathname.includes(o.toLowerCase()) && "bg-[var(--background-dark)]")}
                        >
                            {o}
                        </Link>
                    </div>
                })}
            </div>
            {children}
        </div>
    </AdminProtected>
}