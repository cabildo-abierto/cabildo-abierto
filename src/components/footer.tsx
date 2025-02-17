import Link from "next/link";
import { articleUrl } from "./utils";
import { Logo } from './logo';
import { FaXTwitter } from "react-icons/fa6";
import { SiBluesky } from "react-icons/si";
import {ScrollToButton} from "./ui-utils/scroll-to-button";


export default function Footer({showCA=true}: {showCA?: boolean}) {
    return <footer className="w-screen sm:px-16">
        <div className="relative">
        <hr className="border-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" />
        </div>
        <div className="my-16 flex justify-between sm:px-12 px-4 space-x-4">
            <div className="flex flex-col justify-between">
                <ScrollToButton>
                    <Logo className="w-10 h-10 hover:brightness-90 transition duration-200"/>
                </ScrollToButton>
                <div className="flex space-x-1">
                    <Link target="blank" href="https://bsky.app/profile/cabildoabierto.com.ar" className="hover:text-gray-700 transition duration-200"><SiBluesky fontSize="25"/></Link>
                    <Link target="blank" href="https://x.com/CabildoAbiertoX" className="hover:text-gray-700 transition duration-200"><FaXTwitter fontSize="25"/></Link>
                </div>
            </div>

            <div className="flex flex-wrap gap-x-12 gap-y-4">
                {showCA && <div className="flex flex-col space-y-1">
                    <h4>Cabildo Abierto</h4>
                    <Link href={articleUrl("Cabildo_Abierto")} className="link3">FAQ</Link>
                    <Link
                    
                        href={articleUrl("Cabildo_Abierto%3A_Términos_y_condiciones")}
                        className="link3"
                    
                    >
                        Términos y condiciones
                    </Link>
                    <Link
                        href={articleUrl("Cabildo_Abierto%3A_Política_de_privacidad")}
                        className="link3"
                    >Política de privacidad</Link>
                </div>}

                <div className="flex flex-col space-y-1">
                    <h4>Contacto</h4>
                    <Link className="link3" href="mailto:soporte@cabildoabierto.com.ar">
                    soporte@cabildoabierto.com.ar
                    </Link>
                    <Link className="link3" href="mailto:soporte@cabildoabierto.com.ar">
                    contacto@cabildoabierto.com.ar
                    </Link>
                </div>
            </div>

        </div>
    </footer>
}