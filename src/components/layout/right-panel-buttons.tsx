import React from "react";
import {CustomLink as Link} from "../../../modules/ui-utils/src/custom-link";
import {topicUrl} from "@/utils/uri";
import {useSession} from "@/queries/getters/useSession";


export const RightPanelButtons = () => {
    const {user} = useSession()

    if (!user) return null

    return <div className={"w-full flex flex-wrap gap-1"}>
        <div className={"uppercase flex gap-x-1 flex-wrap leading-[16px] text-[0.598rem] text-[var(--text-light)]"}>
            <Link href={"/soporte"} className={"hover:text-[var(--text)]"}>
                Soporte
            </Link>
            <div>
                •
            </div>
            <Link
                className="hover:text-[var(--text)]"
                href={topicUrl("Cabildo Abierto: Solicitudes de usuarios", undefined, "normal")}
            >
                Sugerencias
            </Link>
            <div>
                •
            </div>
            <Link className="hover:text-[var(--text)]" href={topicUrl("Cabildo Abierto", undefined, "normal")}>
                Preguntas frecuentes
            </Link>
            <div>
                •
            </div>
            <Link className="hover:text-[var(--text)]"
                  href={topicUrl("Cabildo Abierto: Términos y condiciones", undefined, "normal")}>
                Términos y condiciones
            </Link>
            <div>
                •
            </div>
            <Link className="hover:text-[var(--text)]"
                  href={topicUrl("Cabildo Abierto: Política de privacidad", undefined, "normal")}>
                Política de privacidad
            </Link>
        </div>
    </div>
}