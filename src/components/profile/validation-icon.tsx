import {ValidationState} from "@/lib/types";
import DescriptionOnHover from "../layout/utils/description-on-hover";
import {topicUrl} from "@/utils/uri";
import {CheckCircleIcon, UserCircleIcon} from "@phosphor-icons/react";


const ValidationIcon = ({
                            handle,
                            verification,
                            fontSize = 22,
    color="var(--text)"
}: {
    fontSize?: number
    handle?: string
    verification: ValidationState
    color?: string
}) => {
    const moreInfoHref = topicUrl("Cabildo Abierto: Verificación de cuentas")

    if (verification == "person" || verification == "persona") {
        return <DescriptionOnHover description={handle && `@${handle} es una persona real.`} moreInfoHref={moreInfoHref}>
            <UserCircleIcon
                fontSize={fontSize}
                color={color}
                weight={"fill"}
            />
        </DescriptionOnHover>
    } else if (verification == "org") {
        return <DescriptionOnHover description={handle && `@${handle} es una organización verificada.`} moreInfoHref={moreInfoHref}>
            <CheckCircleIcon
                fontSize={fontSize}
                color={color}
                weight={"bold"}
            />
        </DescriptionOnHover>
    }

    return null
}


export default ValidationIcon;