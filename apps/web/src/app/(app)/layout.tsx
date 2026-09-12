import type {ReactNode} from "react";
import {Topbar} from "@/components/topbar";
import {AppSessionGate} from "@/components/app-session-gate";

export default function AppLayout({children}: {children: ReactNode}) {
    return <AppSessionGate>
        <Topbar/>
        <main>{children}</main>
    </AppSessionGate>;
}
