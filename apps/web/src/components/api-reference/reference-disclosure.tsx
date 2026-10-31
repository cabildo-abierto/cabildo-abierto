"use client";

import type {ReactNode} from 'react';
import {Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger} from '@/components/ui/accordion';
import {cn} from '@/lib/utils';

export function ReferenceDisclosure({title, children, defaultOpen = false, bordered = false, className}: {
    title: string; children: ReactNode; defaultOpen?: boolean; bordered?: boolean; className?: string;
}) {
    return <Accordion defaultValue={defaultOpen ? ['content'] : []} className={cn(bordered && 'rounded-md border border-border bg-muted/15 p-3', className)}>
        <AccordionItem value="content">
            <AccordionHeader render={<div/>}>
                <AccordionTrigger className={cn('justify-between gap-3 text-xs font-medium text-muted-foreground [&>svg]:size-3.5 motion-reduce:[&>svg]:transition-none')}>
                    {title}
                </AccordionTrigger>
            </AccordionHeader>
            <AccordionContent className={cn('overflow-hidden [&>div]:pt-2')}>{children}</AccordionContent>
        </AccordionItem>
    </Accordion>;
}
