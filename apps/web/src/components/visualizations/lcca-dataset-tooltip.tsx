"use client";

import {useMemo} from 'react';
import {useQuery} from '@tanstack/react-query';
import {Tooltip} from '@base-ui/react/tooltip';
import type {DatasetSourceDetails} from '@cabildo-abierto/api';
import {ArrowUpRightIcon} from '@phosphor-icons/react';
import {DATASET_TYPE_NAMES} from '@cabildo-abierto/utils';
import type {LccaDatasetHover} from '@/hooks/use-lcca-dataset-hover';
import {dataViewRequest} from '@/utils/react/data-view-request';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Spinner} from '@/components/ui/spinner';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';

export function LccaDatasetTooltip({hovered, onPointerEnter, onPointerLeave, onClose, onOpen}: {
    hovered: LccaDatasetHover; onPointerEnter: () => void; onPointerLeave: () => void; onClose: () => void;
    onOpen: (source: DatasetSourceDetails) => void;
}) {
    const {reference, rect} = hovered;
    const anchor = useMemo(() => ({getBoundingClientRect: () => rect}), [rect]);
    const result = useQuery({
        queryKey: ['dataset-source', reference.topicId, reference.blockNumber],
        queryFn: ({signal}) => dataViewRequest<DatasetSourceDetails>(`/datasets/${encodeURIComponent(reference.topicId)}/${encodeURIComponent(reference.blockNumber)}`, {signal}),
        staleTime: query => query.state.data?.block ? 30000 : 0, retry: false,
    });
    return <Tooltip.Root open onOpenChange={open => { if (!open) onClose(); }}>
        <Tooltip.Portal><Tooltip.Positioner anchor={anchor} side="top" sideOffset={8} collisionPadding={12} className={cn('z-[100]')}
            onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave}>
            <Tooltip.Popup data-attachment-editor-popup className={cn('w-80 max-w-[calc(100vw-2rem)] rounded-md border bg-popover p-3 text-xs text-popover-foreground shadow-md')}>
                {result.isPending && <div role="status" className={cn('flex items-center gap-2')}><Spinner className={cn('size-3')}/>Cargando columnas…</div>}
                {result.error && <p role="alert" className={cn('text-destructive')}>{result.error.message}</p>}
                {result.data && <>
                    <p className={cn('break-words font-medium')}>{result.data.title}</p>
                    <p className={cn('mt-1 mb-2 break-words text-muted-foreground')}>{result.data.topic.title} · {reference.blockNumber}</p>
                    <ScrollArea className={cn('max-h-60')}>
                        <dl aria-label="Columnas del conjunto de datos" className={cn('space-y-1 pr-3')}>
                            {result.data.columns.map(column => <div key={column.name} className={cn('flex items-start justify-between gap-3')}>
                                <dt className={cn('min-w-0 break-words font-mono')}>{column.name}</dt>
                                <dd className={cn('shrink-0 text-muted-foreground')}>{DATASET_TYPE_NAMES[column.type]}</dd>
                            </div>)}
                        </dl>
                    </ScrollArea>
                    {!result.data.columns.length && <p className={cn('text-muted-foreground')}>Este conjunto de datos no tiene columnas.</p>}
                    <div className={cn('mt-3 flex justify-end')}>
                        <Button type="button" variant="outline" size="xs" disabled={!result.data.block} onClick={event => {
                            event.stopPropagation();
                            onOpen(result.data!);
                        }}><ArrowUpRightIcon/>Ver datos</Button>
                    </div>
                </>}
            </Tooltip.Popup>
        </Tooltip.Positioner></Tooltip.Portal>
    </Tooltip.Root>;
}
