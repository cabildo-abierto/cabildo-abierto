import {ValidationState} from "@/lib/types";
import {CheckCircle} from "@phosphor-icons/react";
import {UserCircle} from "@phosphor-icons/react";
import DescriptionOnHover from "../../../modules/ui-utils/src/description-on-hover";
import {topicUrl} from "@/utils/uri";
import { Color } from "../../../modules/ui-utils/src/button";


const ValidationIcon = ({handle, validation, fontSize = 22, color="primary"}: {
    fontSize?: number, handle: string, validation: ValidationState, color?: Color }) => {
    const moreInfoHref = topicUrl("Cabildo Abierto: Verificación de cuentas")

    if (validation == "persona") {
        return <DescriptionOnHover description={handle && `@${handle} es una persona real.`} moreInfoHref={moreInfoHref}>
            <div style={{backgroundColor: `var(--${color})`}} className={"rounded-full"}>
                <UserCircle fontSize={fontSize} color={"var(--text)"} weight={"fill"}/>
            </div>
        </DescriptionOnHover>
    } else if (validation == "org") {
        return <DescriptionOnHover description={handle && `@${handle} es una organización verificada.`} moreInfoHref={moreInfoHref}>
            <div style={{backgroundColor: `var(--${color})`}} className={"rounded-full"}>
                <CheckCircle fontSize={fontSize} color={"var(--text)"} weight={"bold"}/>
            </div>
        </DescriptionOnHover>
    }

    return null
}


export default ValidationIcon;