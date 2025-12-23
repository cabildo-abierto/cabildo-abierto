"use client"
import LandingTopbar from "@/components/presentacion/landing-topbar";
import {LandingFirstScreen} from "@/components/presentacion/landing-first-screen";
import {LandingScroll} from "@/components/presentacion/landing-scroll";
import {cn} from "@/lib/utils";

export default function Page() {

    return <div className={cn("presentation")}>
        <LandingTopbar/>

        <LandingFirstScreen/>

        <LandingScroll/>
    </div>
}