import {ValidationState} from "@/lib/types";
import DescriptionOnHover from "../../../modules/ui-utils/src/description-on-hover";
import {topicUrl} from "@/utils/uri";
import {CheckCircleIcon, UserCircleIcon} from "@phosphor-icons/react";
import {Color} from "../../../modules/ui-utils/src/color";


const ValidationIcon = ({handle, validation, fontSize = 22, iconColor="button-text", color="primary"}: {
    fontSize?: number, handle: string, validation: ValidationState, color?: Color, iconColor?: Color }) => {
    const moreInfoHref = topicUrl("Cabildo Abierto: Verificación de cuentas")

    if (validation == "person" || validation == "persona") {
        return <DescriptionOnHover description={handle && `@${handle} es una persona real.`} moreInfoHref={moreInfoHref}>
            <div style={{backgroundColor: `var(--${color})`}} className={"rounded-full"}>
                <UserCircleIcon fontSize={fontSize} color={`var(--${iconColor}`} weight={"fill"}/>
            </div>
        </DescriptionOnHover>
    } else if (validation == "org") {
        return <DescriptionOnHover description={handle && `@${handle} es una organización verificada.`} moreInfoHref={moreInfoHref}>
            <div style={{backgroundColor: `var(--${color})`}} className={"rounded-full"}>
                <CheckCircleIcon fontSize={fontSize} color={`var(--${iconColor})`} weight={"bold"}/>
            </div>
        </DescriptionOnHover>
    }

    return null
}


export default ValidationIcon;