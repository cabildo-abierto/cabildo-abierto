"use client"
import { useEffect, useState } from "react";
import { AuthPage } from "../components/auth-page"
import Footer from "../components/footer"
import { Presentation } from "../components/presentation"
import { useRouter } from "next/navigation";
import { InvalidConfirmLinkPopup } from "./invalid-confirm-link-popup";
import { preload } from "swr";
import { fetcher } from "./hooks/utils";
import { useUser } from "./hooks/user";
import { BaseFullscreenPopup } from "../components/base-fullscreen-popup";
import { AcceptButtonPanel } from "../components/accept-button-panel";
import { CabildoIcon } from "../components/icons";
import Link from "next/link";


export default function Page({searchParams}: {searchParams: {code?: string, error_description?: string}}) {
    const [invalidLink, setInvalidLink] = useState(searchParams.error_description == "Email link is invalid or has expired")
    const router = useRouter()
    const user = useUser() // para prefetchearlo
    const [loggingIn, setLoggingIn] = useState(searchParams.code != undefined)
    const [showingInitialMessage, setShowingInitialMessage] = useState(true)
    
    useEffect(() => {
        preload("/api/entity/Cabildo_Abierto", fetcher)
        preload("/api/entity/Cabildo_Abierto%3A_Términos_y_condiciones", fetcher)
        preload("/api/entity/Cabildo_Abierto%3A_Política_de_privacidad", fetcher)
        preload("/api/user", fetcher)
    }, [])

    const initialMessageContent = <div className="flex flex-col items-center space-y-4">
        <h3>Estamos haciendo algunos ajustes...</h3>
        <div className="text-gray-600 text-sm">No vas a poder iniciar sesión hasta que terminemos.</div>
        <div className="text-gray-600 text-sm">Mientras tanto, podés explorar la página como invitado/a.</div>
        <div className="text-gray-600 text-sm link"><span className="underline">Tip:</span> Te recomendamos empezar por <Link href="/articulo?i=Cabildo_Abierto">¿Qué es Cabildo Abierto?</Link> y desde ahí seguir leyendo las secciones que te interesen, o apretar <CabildoIcon fontSize="inherit"/> para ir al inicio.</div>
    </div>

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
        {showingInitialMessage && <AcceptButtonPanel
            onClose={() => {setShowingInitialMessage(false)}}
            text={initialMessageContent}
        />}
    </div>
}