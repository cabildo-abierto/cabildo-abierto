import {useLayoutConfig} from "../layout-config-context";
import {CustomLink as Link} from "@/components/utils/base/custom-link"
import {topicUrl} from "@/components/utils/react/url";
import React from "react";


export const SidebarBottom = () => {
    const {layoutConfig, setLayoutConfig} = useLayoutConfig()

    function onClickLink() {
        setLayoutConfig({
            ...layoutConfig,
            openSidebar: false
        })
    }

    return <div className={"space-y-2 h-full flex flex-col justify-between pb-4"}>
        <div className={"flex gap-x-1 text-base flex-wrap"}>
            <Link href={"/ajustes/compartir"} onClick={onClickLink}>
                Invitar
            </Link>
            <div>
                •
            </div>
            <Link href={"/aportar"} onClick={onClickLink}>
                Aportar
            </Link>
            <div>
                •
            </div>
            <Link href={"/soporte"} onClick={onClickLink}>
                Soporte
            </Link>
            <div>
                •
            </div>
            <Link href={topicUrl("Cabildo Abierto: Solicitudes de usuarios")}
                  onClick={onClickLink}>
                Sugerencias
            </Link>
            <div>
                •
            </div>
            <Link href={topicUrl("Cabildo Abierto")} onClick={onClickLink}>
                Preguntas frecuentes
            </Link>
        </div>

        <div className={"flex flex-col space-y-1"}>
            <Link href={topicUrl("Cabildo Abierto: Términos y condiciones")} onClick={onClickLink}>
                Términos y condiciones
            </Link>
            <Link href={topicUrl("Cabildo Abierto: Política de privacidad")} onClick={onClickLink}>
                Política de privacidad
            </Link>
        </div>
    </div>
}