import {useMemo} from 'react';
import {Tooltip} from '@base-ui/react/tooltip';
import {cn} from '@/lib/utils';

export type ChartTooltipData = {title: string; rows: {label: string; value: string; color?: string}[]};
export type ChartTooltipState = ChartTooltipData & {clientX: number; clientY: number; selectedX?: number};

export function VisualizationTooltip({data}: {data: ChartTooltipState | null}) {
    const anchor = useMemo(() => ({getBoundingClientRect: () => DOMRect.fromRect({x: data?.clientX ?? 0,y: data?.clientY ?? 0,width: 0,height: 0})}), [data?.clientX,data?.clientY]);
    return <Tooltip.Root open={!!data}>
        <Tooltip.Portal><Tooltip.Positioner anchor={anchor} side="top" sideOffset={12} collisionPadding={12} className={cn('pointer-events-none z-[100]')}>
            <Tooltip.Popup data-attachment-editor-popup className={cn('max-w-[min(22rem,calc(100vw-2rem))] rounded-md border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md')}>
                {data && <><p className={cn('mb-1 truncate font-medium')} title={data.title}>{data.title}</p><dl className={cn('space-y-1')}>{data.rows.map((row,i) => <div key={i} className={cn('flex items-start justify-between gap-4')}>
                    <dt className={cn('flex min-w-0 flex-1 items-center gap-1.5')}>{row.color && <span className={cn('size-2 shrink-0 rounded-full')} style={{backgroundColor: row.color}}/>}<span className={cn('min-w-0 max-w-48 truncate')} title={row.label}>{row.label}</span></dt>
                    <dd className={cn('shrink-0 font-medium tabular-nums')}>{row.value}</dd>
                </div>)}</dl></>}
            </Tooltip.Popup>
        </Tooltip.Positioner></Tooltip.Portal>
    </Tooltip.Root>;
}
