import {ValidationState} from "@/lib/types";
import DescriptionOnHover from "../../../modules/ui-utils/src/description-on-hover";
import {topicUrl} from "@/utils/uri";
import {Color} from "../../../modules/ui-utils/src/color";
import {CheckCircleIcon, UserCircleIcon} from "@phosphor-icons/react";


const ValidationIcon = ({
                            handle,
                            verification,
                            fontSize = 22,
                            iconColor="button-text",
                            color="primary"
}: {
    fontSize?: number
    handle: string
    verification: ValidationState
    color?: Color
    iconColor?: Color
}) => {
    const moreInfoHref = topicUrl("Cabildo Abierto: Verificación de cuentas")

    if (verification == "person" || verification == "persona") {
        return <DescriptionOnHover description={handle && `@${handle} es una persona real.`} moreInfoHref={moreInfoHref}>
            <UserCircleIcon fontSize={fontSize} color={`var(--text)`} weight={"fill"}/>
        </DescriptionOnHover>
    } else if (verification == "org") {
        return <DescriptionOnHover description={handle && `@${handle} es una organización verificada.`} moreInfoHref={moreInfoHref}>
            <CheckCircleIcon fontSize={fontSize} color={`var(--text)`} weight={"bold"}/>
        </DescriptionOnHover>
    }

    return null
}


export default ValidationIcon;