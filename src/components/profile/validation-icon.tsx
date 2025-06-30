import {ValidationState} from "@/lib/types";
import {CheckCircle} from "@phosphor-icons/react";
import {UserCircle} from "@phosphor-icons/react";
import DescriptionOnHover from "../../../modules/ui-utils/src/description-on-hover";
import {topicUrl} from "@/utils/uri";


const ValidationIcon = ({handle, validation}: { handle: string, validation: ValidationState }) => {
    const moreInfoHref = topicUrl("Cabildo Abierto: Verificación de cuentas")

    if (validation == "persona") {
        return <DescriptionOnHover description={`@${handle} es una persona real.`} moreInfoHref={moreInfoHref}>
            <div className={"bg-[var(--primary)] rounded-full"}>
                <UserCircle fontSize={22} color={"white"} weight={"fill"}/>
            </div>
        </DescriptionOnHover>
    } else if (validation == "org") {
        return <DescriptionOnHover description={`@${handle} es una organización verificada.`} moreInfoHref={moreInfoHref}>
            <div className={"bg-[var(--primary)] rounded-full"}>
                <CheckCircle fontSize={22} color={"white"} weight={"bold"}/>
            </div>
        </DescriptionOnHover>
    }

    return null
}


export default ValidationIcon;