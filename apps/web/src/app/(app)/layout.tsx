import type {ReactNode} from "react";
import {Topbar} from "@/components/topbar";

export default function AppLayout({children}: {children: ReactNode}) {
    return <>
        <Topbar/>
        <main>{children}</main>
    </>;
}
