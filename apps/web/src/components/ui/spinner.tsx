import {CircleNotchIcon} from "@phosphor-icons/react";
import type {ComponentProps} from "react";
import {cn} from "@/lib/utils";

export function Spinner({className, ...props}: ComponentProps<"svg">) {
    return <CircleNotchIcon role="status" aria-label="Cargando" className={cn("size-4 animate-spin", className)} {...props}/>;
}
