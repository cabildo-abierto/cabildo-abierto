import {ClockIcon} from "@phosphor-icons/react";
import {ReactNode} from "react";
import {Badge} from "@/components/ui/badge";


export const ExpectedTime = ({children}: { children: ReactNode }) => {
    return <Badge className={"space-x-1"}>
        <ClockIcon fontSize={15}/>
        <div>
            {children}
        </div>
    </Badge>
}