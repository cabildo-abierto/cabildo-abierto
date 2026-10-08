"use client";

import type {ReactNode} from 'react';
import {Dialog} from '@base-ui/react/dialog';
import {ArrowsOutIcon} from '@phosphor-icons/react';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import {VisualizationExpandedWindow} from './visualization-expanded-window';

export function VisualizationExpandedView({title, children}: {title?: string; children: ReactNode}) {
    return <Dialog.Root>
        <Dialog.Trigger render={<Button type="button" variant="ghost" size="sm" className={cn('text-muted-foreground')}/>} aria-label="Ampliar visualización" title="Ampliar visualización" onClick={event => event.stopPropagation()}>
            <ArrowsOutIcon className={cn('size-4')}/>
        </Dialog.Trigger>
        <Dialog.Portal>
            <VisualizationExpandedWindow title={title}>{children}</VisualizationExpandedWindow>
        </Dialog.Portal>
    </Dialog.Root>;
}
