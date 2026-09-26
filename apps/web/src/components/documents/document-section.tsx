import type {ReactNode} from "react";
import {cn} from "@/lib/utils";

export function DocumentSection({children, dataset = false, actions}: {children: ReactNode; dataset?: boolean; actions?: ReactNode}) {
    return <section className={cn("mt-6 space-y-3 border-t pt-3")} aria-label={dataset ? "Conjuntos de datos" : "Documentos"}>
        <div className={cn("flex items-center justify-between gap-2")}>
            <h2 className={cn("text-xs font-medium text-muted-foreground")}>{dataset ? "Conjuntos de datos" : "Documentos"}</h2>
            {actions}
        </div>
        <div className={cn("relative grid grid-cols-2 items-start gap-x-6 gap-y-3 lg:grid-cols-3 [&>*]:min-w-0 [&>*]:2xl:static [&>*>article]:2xl:static [&>*:has(fieldset)]:col-span-full")}>
            {children}
        </div>
    </section>;
}
