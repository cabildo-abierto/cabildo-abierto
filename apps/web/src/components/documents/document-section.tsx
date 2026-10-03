"use client";

import {useState, type ReactNode} from "react";
import {cn} from "@/lib/utils";
import {Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";

export function DocumentSection({children, dataset = false, actions, endActions, after}: {children: ReactNode; dataset?: boolean; actions?: ReactNode; endActions?: ReactNode; after?: ReactNode}) {
    const [expanded, setExpanded] = useState<string[]>([]);
    return <section className={cn("clear-both mt-6 border-t pt-3")} aria-label={dataset ? "Conjuntos de datos" : "Documentos"}>
        <Accordion value={expanded} onValueChange={setExpanded}>
            <AccordionItem value={dataset ? "dataset" : "documento"}>
                <div className={cn("relative flex items-center gap-2 pr-6")}>
                    <AccordionHeader render={<h2/>} className={cn("min-w-0")}>
                        <AccordionTrigger className={cn("min-h-7 text-xs font-medium text-muted-foreground [&>svg]:absolute [&>svg]:right-0")}>{dataset ? "Conjuntos de datos" : "Documentos"}</AccordionTrigger>
                    </AccordionHeader>
                    {expanded.length > 0 && actions}
                    {expanded.length > 0 && endActions && <div className={cn("ml-auto min-w-0")}>{endActions}</div>}
                </div>
                <AccordionContent keepMounted>
                    <div className={cn("relative grid grid-cols-2 items-start gap-x-6 gap-y-3 lg:grid-cols-3 [&>*]:min-w-0 [&>*]:2xl:static [&>*>article]:2xl:static [&>*:has(fieldset)]:col-span-full")}>
                        {children}
                    </div>
                    {after}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </section>;
}
