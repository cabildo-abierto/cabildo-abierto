"use client"
import { useEffect, useState } from "react";
import { AuthPage } from "../components/auth-page"
import Footer from "../components/footer"
import { Presentation } from "../components/presentation"
import { useRouter } from "next/navigation";
import { InvalidConfirmLinkPopup } from "./invalid-confirm-link-popup";
import { preload } from "swr";
import { fetcher } from "./hooks/utils";


export default function Page({searchParams}: {searchParams: {code?: string, error_description?: string}}) {
    const [invalidLink, setInvalidLink] = useState(searchParams.error_description == "Email link is invalid or has expired")
    const router = useRouter()
    
    useEffect(() => {
        preload("/api/entity/Cabildo_Abierto", fetcher)
    }, [])

    return <div><div className="flex lg:flex-row flex-col">
        {invalidLink &&
        <InvalidConfirmLinkPopup onClose={() => {setInvalidLink(false); router.push("/")}}/>}
        <div className="lg:w-1/2 lg:mb-8 lg:flex lg:justify-center lg:items-center">
            <Presentation/>
        </div>
        <div className="lg:w-1/2">
            <AuthPage startInLogin={searchParams.code != undefined}/>
        </div>
    </div>
        <Footer/>
    </div>
}