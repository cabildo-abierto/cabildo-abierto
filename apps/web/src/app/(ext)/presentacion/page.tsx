"use client"
import LandingTopbar from "@/components/presentacion/landing-topbar";
import {LandingFirstScreen} from "@/components/presentacion/landing-first-screen";
import {LandingScroll} from "@/components/presentacion/landing-scroll";
import { Special_Elite, Courier_Prime, IBM_Plex_Mono, JetBrains_Mono } from 'next/font/google'
import {cn} from "@/lib/utils";

const special_elite = Special_Elite({
    subsets: ['latin'],
    weight: ["400"]
})

const courier_prime = Courier_Prime({
    subsets: ["latin", "latin-ext"],
    weight: ["400", "700"]
})

const ibm_plex_mono = IBM_Plex_Mono({
    subsets: ["latin", "latin-ext"],
    weight: ["100", "200", "300", "400", "500", "600", "700"]
})

const jetbrains_mono = JetBrains_Mono({
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700"]
})

export default function Page() {

    return <div className={cn("presentation")}>
        <LandingTopbar/>

        <LandingFirstScreen/>

        <LandingScroll/>
    </div>
}