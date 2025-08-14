import {ValidationState} from "@/lib/types";
import DescriptionOnHover from "../../../modules/ui-utils/src/description-on-hover";
import {topicUrl} from "@/utils/uri";
import { Color } from "../../../modules/ui-utils/src/button";
import Image from "next/image"
import {SealCheckIcon} from "@phosphor-icons/react";


const ValidationIcon = ({handle, validation, fontSize = 22, width=12, height=12, iconColor="button-text", color="primary"}: {
    fontSize?: number, handle: string, width?: number, height?: number, validation: ValidationState, color?: Color, iconColor?: Color }) => {
    const moreInfoHref = topicUrl("Cabildo Abierto: Verificación de cuentas")

    if (validation == "person" || validation == "persona") {
        return <DescriptionOnHover description={handle && `@${handle} es una persona real argentina.`} moreInfoHref={moreInfoHref}>
            <Image alt="escarapela" style={{width, height}} src={"/escarapela.png"} width={400} height={400}/>
        </DescriptionOnHover>
    } else if (validation == "org") {
        return <DescriptionOnHover description={handle && `@${handle} es una organización verificada.`} moreInfoHref={moreInfoHref}>
            <span className={"text-[var(--text)]"}>
                <SealCheckIcon color="var(--primary)" fontSize={18} weight={"fill"}/>
            </span>
        </DescriptionOnHover>
    }

    return null
}


export default ValidationIcon;