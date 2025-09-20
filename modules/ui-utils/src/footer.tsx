import {Logo} from './logo';

import {ScrollToButton} from "./scroll-to-button";
import {topicUrl} from "@/utils/uri";
import {dimOnHoverClassName, DimOnHoverLink} from "./dim-on-hover-link";
import BlueskyLogo from "@/components/icons/bluesky-logo";
import {GithubLogoIcon, XLogoIcon} from "@phosphor-icons/react";
import {ReactNode} from "react";
import {Color} from "./color";


const FooterLeftSide = () => {
    return <div className="flex flex-col justify-between items-start space-y-16 min-w-24">
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
                <BlueskyLogo className={"w-[22px] h-[22px]"}/>
            </DimOnHoverLink>
            <DimOnHoverLink
                target="_blank"
                href="https://x.com/CabildoAbiertoX"
            >
                <XLogoIcon fontSize="25"/>
            </DimOnHoverLink>
            <DimOnHoverLink
                target="_blank"
                href="https://github.com/cabildo-abierto"
            >
                <GithubLogoIcon fontSize={22}/>
            </DimOnHoverLink>
        </div>
    </div>
}


const FooterLink = ({children, href}: {href: string, children: ReactNode}) => {
    return <DimOnHoverLink className="font-extralight" href={href}>
        {children}
    </DimOnHoverLink>
}


export const FooterRightSide = ({showCA}: { showCA: boolean }) => {
    return <div className="flex flex-wrap gap-x-12 text-sm gap-y-4">
        {showCA && <div className="flex flex-col space-y-1 uppercase">
            <div className={"font-extrabol"}>Cabildo Abierto</div>
            <FooterLink href={topicUrl("Cabildo Abierto", undefined, "normal")}>
                FAQ
            </FooterLink>
            <FooterLink href={topicUrl("Cabildo Abierto: Términos y condiciones", undefined, "normal")}>
                Términos y condiciones
            </FooterLink>
            <FooterLink href={topicUrl("Cabildo Abierto: Política de privacidad", undefined, "normal")}>
                Política de privacidad
            </FooterLink>
            <FooterLink href={"/equipo"}>
                Nosotros
            </FooterLink>
        </div>}

        <div className="flex flex-col space-y-1">
            <div className={"font-extrabol uppercase"}>Contacto</div>
            <FooterLink href="mailto:soporte@cabildoabierto.ar">
                soporte@cabildoabierto.ar
            </FooterLink>
            <FooterLink href="mailto:soporte@cabildoabierto.ar">
                contacto@cabildoabierto.ar
            </FooterLink>
        </div>
    </div>
}


export default function Footer({showCA = true, color="background"}: { showCA?: boolean, color?: Color }) {
    return <div
        className="flex justify-between px-4 md:px-16 space-x-4 sm:space-x-12 py-12"
        style={{backgroundColor: `var(--${color})`}}
    >
        <FooterLeftSide/>
        <FooterRightSide showCA={showCA}/>
    </div>
}