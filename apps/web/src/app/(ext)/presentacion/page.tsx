"use client"
import LandingTopbar from "@/components/presentacion/landing-topbar";
import {LandingFirstScreen} from "@/components/presentacion/landing-first-screen";
import {LandingScroll} from "@/components/presentacion/landing-scroll";
import {cn} from "@/lib/utils";
import {WorkInProgressScreen} from "@/components/presentacion/work-in-progress-screen";

export default function Page() {
    const isWipView = process.env.NEXT_PUBLIC_WEB_VIEW === "wip"

    if(isWipView) {
        return <div className={cn("presentation flex flex-1 min-h-0")}>
            <WorkInProgressScreen/>
        </div>
    }

    return <div className={cn("presentation")}>
        <LandingTopbar/>

        <LandingFirstScreen/>

        <LandingScroll/>
    </div>
}
