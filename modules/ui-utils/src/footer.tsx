import { Logo } from './logo';
import { FaXTwitter } from "react-icons/fa6";
import { SiBluesky } from "react-icons/si";
import {ScrollToButton} from "./scroll-to-button";
import {topicUrl} from "@/utils/uri";
import {dimOnHoverClassName, DimOnHoverLink} from "./dim-on-hover-link";


const FooterHorizontalRule = () => {
    return <div className="relative">
        <hr className="border-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent"/>
    </div>
}


const FooterLeftSide = () => {
    return <div className="flex flex-col justify-between space-y-16">
        <ScrollToButton>
            <div className={dimOnHoverClassName}>
                <Logo width={40} height={40}/>
            </div>
        </ScrollToButton>
        <div className="flex space-x-1">
            <DimOnHoverLink
                target="_blank"
                href="https://bsky.app/profile/cabildoabierto.com.ar"
            >
                <SiBluesky fontSize="25"/>
            </DimOnHoverLink>
            <DimOnHoverLink
                target="_blank"
                href="https://x.com/CabildoAbiertoX"
            >
                <FaXTwitter fontSize="25"/>
            </DimOnHoverLink>
        </div>
    </div>
}


export const FooterRightSide = ({showCA}: {showCA: boolean}) => {
    return <div className="flex flex-wrap gap-x-12 gap-y-4">
        {showCA && <div className="flex flex-col space-y-1">
            <h4>Cabildo Abierto</h4>
            <DimOnHoverLink href={topicUrl("Cabildo_Abierto")}>
                FAQ
            </DimOnHoverLink>
            <DimOnHoverLink href={topicUrl("Cabildo_Abierto%3A_Términos_y_condiciones")}>
                Términos y condiciones
            </DimOnHoverLink>
            <DimOnHoverLink href={topicUrl("Cabildo_Abierto%3A_Política_de_privacidad")}>
                Política de privacidad
            </DimOnHoverLink>
        </div>}

        <div className="flex flex-col space-y-1">
            <h4>Contacto</h4>
            <DimOnHoverLink href="mailto:soporte@cabildoabierto.com.ar">
                soporte@cabildoabierto.com.ar
            </DimOnHoverLink>
            <DimOnHoverLink href="mailto:soporte@cabildoabierto.com.ar">
                contacto@cabildoabierto.com.ar
            </DimOnHoverLink>
        </div>
    </div>
}


export default function Footer({showCA = true}: { showCA?: boolean }) {
    return <footer className="w-full">
        <FooterHorizontalRule/>

        <div className="my-8 flex justify-between px-12 space-x-4 w-full py-4">
            <FooterLeftSide/>
            <FooterRightSide showCA={showCA}/>
        </div>
    </footer>
}