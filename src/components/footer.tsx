"use client"

import { CustomLink as Link } from './custom-link';
import { useState } from "react";
import { createPortal } from "react-dom";
import { AcceptButtonPanel } from "./accept-button-panel";
import { articleUrl } from "./utils";

export default function Footer() {
    const [showingContactUs, setShowingContactUs] = useState(false)

    return <footer className="border-t border-gray-300 px-2 w-screen text-gray-800 flex items-center justify-center text-center text-[var(--text-light)] text-sm sm:text-base">
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
        </div>
        <AcceptButtonPanel
            open={showingContactUs}
            onClose={() => {setShowingContactUs(false)}}>
            <div className="text-lg">
                <h2>Envianos tu mensaje</h2>
                <p className="mt-8 text-[var(--text-light)]">Consultas relacionadas con el uso de la plataforma:</p>
                <Link className="link3" href="mailto:soporte@cabildoabierto.com.ar">soporte@cabildoabierto.com.ar</Link>
                <p className="mt-4 text-[var(--text-light)]">Cualquier otra consulta o mensaje:</p>
                <Link className="link3" href="mailto:soporte@cabildoabierto.com.ar">contacto@cabildoabierto.com.ar</Link>
            </div>
        </AcceptButtonPanel>
    </footer>
}