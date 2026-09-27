"use client";

import {Accordion as AccordionPrimitive} from "@base-ui/react/accordion";
import {CaretDownIcon} from "@phosphor-icons/react";
import {cn} from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;
const AccordionItem = AccordionPrimitive.Item;
const AccordionHeader = AccordionPrimitive.Header;

function AccordionTrigger({className, children, ...props}: AccordionPrimitive.Trigger.Props) {
    return <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn("flex w-full items-center gap-2 rounded-sm text-left outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring [&[data-panel-open]>svg]:rotate-180", className)}
        {...props}>
        {children}
        <CaretDownIcon className={cn("size-4 shrink-0 transition-transform duration-200")}/>
    </AccordionPrimitive.Trigger>;
}

function AccordionContent({className, children, ...props}: AccordionPrimitive.Panel.Props) {
    return <AccordionPrimitive.Panel
        data-slot="accordion-content"
        className={cn("animate-[section-collapse_200ms_ease-out] data-open:animate-[section-expand_200ms_ease-out] motion-reduce:animate-none", className)}
        {...props}>
        <div className={cn("pt-3")}>{children}</div>
    </AccordionPrimitive.Panel>;
}

export {Accordion, AccordionItem, AccordionHeader, AccordionTrigger, AccordionContent};
