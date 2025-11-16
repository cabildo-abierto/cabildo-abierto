import React from "react";
import {CustomLink as Link} from "@/components/utils/base/custom-link"
import {topicUrl} from "@/components/utils/react/url";


const RightPanelButtonsItem = ({children, href}: {
    href: string
    children: string
}) => {
    return <Link
        href={href}
        className={"hover:text-[var(--text-light)]"}
    >
        {children}
    </Link>
}


export const RightPanelButtons = () => {
    return <div className={"w-full flex flex-wrap gap-1"}>
        <div className={"uppercase flex gap-x-1 flex-wrap leading-[16px] text-[0.598rem]"}>
            <RightPanelButtonsItem href={"/soporte"}>
                Soporte
            </RightPanelButtonsItem>
            <div>
                •
            </div>
            <RightPanelButtonsItem
                href={topicUrl("Cabildo Abierto: Solicitudes de usuarios")}
            >
                Sugerencias
            </RightPanelButtonsItem>
            <div>
                •
            </div>
            <RightPanelButtonsItem
                href={topicUrl("Cabildo Abierto")}
            >
                Preguntas frecuentes
            </RightPanelButtonsItem>
            <div>
                •
            </div>
            <RightPanelButtonsItem
                  href={topicUrl("Cabildo Abierto: Términos y condiciones")}
            >
                Términos y condiciones
            </RightPanelButtonsItem>
            <div>
                •
            </div>
            <RightPanelButtonsItem
                  href={topicUrl("Cabildo Abierto: Política de privacidad")}
            >
                Política de privacidad
            </RightPanelButtonsItem>
        </div>
    </div>
}