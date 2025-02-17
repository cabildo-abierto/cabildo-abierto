import Link from 'next/link'
import { TopbarLogo } from "../../components/logo";



export default function Page() {

    const center = <div className="flex justify-center">
        <div className="fixed top-0 left-0 w-screen">
            <div className="topbar-container">
                <div className="px-2">
                    <TopbarLogo/>
                </div>
            </div>
        </div>

        <div className="max-w-72 sm:max-w-[512px] flex flex-col items-center">
            <h1 className="py-8 mt-12 text-3xl text-center">Trabajá con nosotros</h1>

            <div className="py-4 text-lg text-center">
                Trabajamos para construir la mejor herramienta comunicacional posible para la discusión pública.
            </div>

            <div className="py-4 text-lg link text-center">
                Si te interesa sumarte al equipo, escribinos a <Link href="mailto:contacto@cabildoabierto.com.ar">contacto@cabildoabierto.com.ar</Link>.
            </div>
        </div>
    </div>

    return center
}