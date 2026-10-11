"use client";

import type {ReactNode} from 'react';
import {Dialog} from '@base-ui/react/dialog';
import {ArrowsOutIcon} from '@phosphor-icons/react';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import {ExpandedWindow} from '@/components/expanded-window';

export function ExpandedView({title, children, kind}: {title?: string; children: ReactNode; kind: "visualization" | "table"}) {
    const label = kind === "table" ? "Ampliar tabla" : "Ampliar visualización";
    return <Dialog.Root>
        <Dialog.Trigger render={<Button type="button" variant="ghost" size="sm" className={cn('text-muted-foreground')}/>} aria-label={label} title={label} onClick={event => event.stopPropagation()}>
            <ArrowsOutIcon className={cn('size-4')}/>
        </Dialog.Trigger>
        <Dialog.Portal>
            <ExpandedWindow title={title} kind={kind}>{children}</ExpandedWindow>
        </Dialog.Portal>
    </Dialog.Root>;
}
