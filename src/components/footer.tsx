"use client"

import { CustomLink as Link } from './custom-link';
import { useState } from "react";
import { createPortal } from "react-dom";
import { AcceptButtonPanel } from "./accept-button-panel";
import { articleUrl } from "./utils";

export default function Footer() {
    const [showingContactUs, setShowingContactUs] = useState(false)

    return <footer className="border-gray-300 px-2 w-screen text-gray-800 flex items-center justify-center text-center text-[var(--text-light)] text-xs sm:text-sm">
        <div className="lg:space-x-6 flex flex-col lg:flex-row">
            <div className=""><button className="link3" onClick={() => {setShowingContactUs(true)}}>
                Contacto
            </button>
            </div>
            <Link
                href="/sumate"
                className="link3"
            >
                Trabajá con nosotros
            </Link>
            <Link href={articleUrl("Cabildo_Abierto%3A_Política_de_privacidad")} className="link3">
                Política de privacidad
            </Link>
            <Link
                href={articleUrl("Cabildo_Abierto%3A_Términos_y_condiciones")}
                className="link3"
            >
                Términos y condiciones
            </Link>
            <Link
                href={articleUrl("Cabildo_Abierto")}
                className="link3"
            >
                FAQ
            </Link>
        </div>
        <AcceptButtonPanel
            open={showingContactUs}
            onClose={() => {setShowingContactUs(false)}}>
            <div className="text-lg flex flex-col">
                <h2>Envianos tu mensaje</h2>
                <Link className="link3 mt-8" href="mailto:soporte@cabildoabierto.com.ar">soporte@cabildoabierto.com.ar</Link>
                <Link className="link3 mt-1" href="mailto:soporte@cabildoabierto.com.ar">contacto@cabildoabierto.com.ar</Link>
            </div>
        </AcceptButtonPanel>
    </footer>
}