import {Logo} from './logo';

import {ScrollToButton} from "./scroll-to-button";
import {topicUrl} from "@/utils/uri";
import {dimOnHoverClassName, DimOnHoverLink} from "./dim-on-hover-link";
import { Color } from './button';
import BlueskyLogo from "@/components/icons/bluesky-logo";
import {XLogoIcon} from "@phosphor-icons/react";



const FooterLeftSide = () => {
    return <div className="flex flex-col justify-between space-y-16">
        <ScrollToButton>
            <div className={dimOnHoverClassName}>
                <Logo width={40} height={40}/>
            </div>
        </ScrollToButton>
        <div className="flex space-x-1 items-center">
            <DimOnHoverLink
                target="_blank"
                href="https://bsky.app/profile/cabildoabierto.ar"
            >
                <BlueskyLogo className={"w-[22] h-[22]"}/>
            </DimOnHoverLink>
            <DimOnHoverLink
                target="_blank"
                href="https://x.com/CabildoAbiertoX"
            >
                <XLogoIcon fontSize="25"/>
            </DimOnHoverLink>
        </div>
    </div>
}


export const FooterRightSide = ({showCA}: { showCA: boolean }) => {
    return <div className="flex flex-wrap gap-x-12 gap-y-4">
        {showCA && <div className="flex flex-col space-y-1">
            <h4>Cabildo Abierto</h4>
            <DimOnHoverLink target="_blank" href={topicUrl("Cabildo Abierto", undefined, "normal")}>
                FAQ
            </DimOnHoverLink>
            <DimOnHoverLink target="_blank" href={topicUrl("Cabildo Abierto: Términos y condiciones", undefined, "normal")}>
                Términos y condiciones
            </DimOnHoverLink>
            <DimOnHoverLink target="_blank" href={topicUrl("Cabildo Abierto: Política de privacidad", undefined, "normal")}>
                Política de privacidad
            </DimOnHoverLink>
        </div>}

        <div className="flex flex-col space-y-1 text-sm md:text-base">
            <h4 className={"font-extrabold"}>Contacto</h4>
            <DimOnHoverLink href="mailto:soporte@cabildoabierto.ar">
                soporte@cabildoabierto.ar
            </DimOnHoverLink>
            <DimOnHoverLink href="mailto:soporte@cabildoabierto.ar">
                contacto@cabildoabierto.ar
            </DimOnHoverLink>
        </div>
    </div>
}


export default function Footer({showCA = true, color="background"}: { showCA?: boolean, color?: Color }) {
    return <div className="flex justify-between px-4 md:px-16 space-x-4 py-12" style={{backgroundColor: `var(--${color})`}}>
        <FooterLeftSide/>
        <FooterRightSide showCA={showCA}/>
    </div>
}