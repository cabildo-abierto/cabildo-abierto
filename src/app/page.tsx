"use client"
import { useState } from "react";
import { AuthPage } from "../components/auth-page"
import Footer from "../components/footer"
import { Presentation } from "../components/presentation"
import { useRouter } from "next/navigation";


const InvalidConfirmLinkPopup = ({onClose}: {onClose: any}) => {
    return (
        <div className="fixed inset-0 bg-opacity-50 bg-gray-800 z-10 flex justify-center items-center backdrop-blur-sm">
            
            <div className="bg-[var(--background)] rounded border-2 border-black p-8 z-10 text-center max-w-lg">
                <div className="py-4 text-lg">El link de verificación expiró o es inválido.</div>
                <div className="flex justify-center items-center py-8 space-x-4">
                    <button onClick={onClose} className="gray-btn">
                        Ok
                    </button>
                </div>
            </div>
        </div>
    );
};


export default function Page({searchParams}: {searchParams: {code?: string, error_description?: string}}) {
    const [invalidLink, setInvalidLink] = useState(searchParams.error_description == "Email link is invalid or has expired")
    const router = useRouter()
    return <div className="flex lg:flex-row flex-col">
        {invalidLink &&
        <InvalidConfirmLinkPopup onClose={() => {setInvalidLink(false); router.push("/")}}/>}
        <div className="lg:w-1/2 lg:mb-8 lg:flex lg:justify-center lg:items-center">
            <Presentation/>
        </div>
        <div className="lg:w-1/2 h-screen">
            <AuthPage startInLogin={searchParams.code != undefined}/>
        </div>
        <Footer/>
    </div>
}