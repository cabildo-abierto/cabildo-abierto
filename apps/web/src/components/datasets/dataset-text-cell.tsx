"use client";

import {Tooltip} from '@base-ui/react/tooltip';
import {cn} from '@/lib/utils';

export function DatasetTextCell({text}: {text: string}) {
    return <Tooltip.Root>
        <Tooltip.Trigger delay={300} className={cn('block w-full min-w-0 cursor-default text-left')}>
            <span className={cn('line-clamp-5 whitespace-pre-wrap wrap-anywhere')}>{text}</span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
            <Tooltip.Positioner side="top" sideOffset={8} collisionPadding={12} className={cn('z-[100]')}>
                <Tooltip.Popup data-attachment-editor-popup className={cn('max-h-[min(24rem,var(--available-height))] w-96 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-md border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md whitespace-pre-wrap wrap-anywhere select-text')}>
                    {text}
                </Tooltip.Popup>
            </Tooltip.Positioner>
        </Tooltip.Portal>
    </Tooltip.Root>;
}
