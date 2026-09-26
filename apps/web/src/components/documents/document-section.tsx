import type {ReactNode} from "react";
import {cn} from "@/lib/utils";

export function DocumentSection({children}: {children: ReactNode}) {
    return <section className={cn("mt-6 space-y-3 border-t pt-3")} aria-label="Documentos">
        <h2 className={cn("text-xs font-medium text-muted-foreground")}>Documentos</h2>
        <div className={cn("relative grid grid-cols-2 items-start gap-x-6 gap-y-3 lg:grid-cols-3 [&>*]:min-w-0 [&>*]:2xl:static [&>*>article]:2xl:static [&>*:has(fieldset)]:col-span-full")}>
            {children}
        </div>
    </section>;
}
