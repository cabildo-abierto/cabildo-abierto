import Link from "next/link";

export default function Footer() {
    return <footer className="border-t border-gray-300 px-2 w-screen text-gray-800 flex flex-col lg:flex-row items-center justify-center text-center text-[var(--text-light)] space-x-4 text-sm">
        <Link className="link3" href="mailto:contacto@cabildoabierto.com.ar">
        contacto@cabildoabierto.com.ar
        </Link>
        <Link href="/articulo/Cabildo_Abierto%3A_Política_de_privacidad" className="link3">
        Política de privacidad
        </Link>
        <Link
            href="/articulo/Cabildo_Abierto%3A_Términos_y_condiciones"
            className="link3"
        >
        Términos de servicio
        </Link>
    </footer>
}