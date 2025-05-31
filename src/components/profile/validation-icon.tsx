import {ValidationState} from "@/lib/types";
import { CheckCircle } from "@phosphor-icons/react";
import { UserCircle } from "@phosphor-icons/react";


const ValidationIcon = ({handle, validation}: {handle: string, validation: ValidationState}) => {
    if(validation == "persona"){
        return <div className={"bg-[var(--primary)] rounded-full"} title={`@${handle} es una persona real.`}>
            <UserCircle fontSize={22} color={"white"} weight={"fill"}/>
        </div>
    } else if(validation == "org") {
        return <div className={"bg-[var(--primary)] rounded-full"} title={`@${handle} es una organización verificada.`}>
            <CheckCircle fontSize={22} color={"white"} weight={"bold"}/>
        </div>
    }

    return null
}


export default ValidationIcon;