"use client"
import { useEffect, useState } from "react";
import { AuthPage } from "../components/auth-page"
import Footer from "../components/footer"
import { Presentation } from "../components/presentation"
import { useRouter } from "next/navigation";
import { preload } from "swr";
import { useUser } from "../app/hooks/user";
import { fetcher } from "../app/hooks/utils";
import { InvalidConfirmLinkPopup } from "../app/invalid-confirm-link-popup";



export const HomePage = ({searchParams}: {searchParams: {code?: string, error_description?: string}}) => {
    const [invalidLink, setInvalidLink] = useState(searchParams.error_description == "Email link is invalid or has expired")
    const router = useRouter()
    const user = useUser() // para prefetchearlo
    const [loggingIn, setLoggingIn] = useState(searchParams.code != undefined)
    // const [showingInitialMessage, setShowingInitialMessage] = useState(true)
    
    useEffect(() => {
        preload("/api/entity/Cabildo_Abierto", fetcher)
        preload("/api/entity/Cabildo_Abierto%3A_Términos_y_condiciones", fetcher)
        preload("/api/entity/Cabildo_Abierto%3A_Política_de_privacidad", fetcher)
        preload("/api/user", fetcher)
    }, [])

    return <div>
        <div className="flex lg:flex-row flex-col min-h-screen-minus-footer px-1">
            {invalidLink &&
                <InvalidConfirmLinkPopup onClose={() => {setInvalidLink(false); router.push("/")}}/>
            }
            <div className="lg:w-1/2 lg:mb-8 lg:flex lg:justify-center lg:items-center">
                <Presentation loggingIn={loggingIn} setLoggingIn={setLoggingIn}/>
            </div>
            <div className="lg:w-1/2">
                <AuthPage
                    loggingIn={loggingIn}
                    setLoggingIn={setLoggingIn}
                />
            </div>
        </div>
        <Footer/>
        {/*showingInitialMessage && <AcceptButtonPanel
            onClose={() => {setShowingInitialMessage(false)}}
            text={initialMessageContent}
        />*/}
    </div>
}