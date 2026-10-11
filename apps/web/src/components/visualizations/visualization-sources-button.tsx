"use client";
import type {LccaOutput} from '@cabildo-abierto/api';
import {parseVisualizationBlock} from '@cabildo-abierto/utils';
import {skipToken, useQuery} from '@tanstack/react-query';
import {DatabaseIcon} from '@phosphor-icons/react';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';

export function VisualizationSourcesButton({content, open, panelId, onToggle}: {
    content: string; open: boolean; panelId: string; onToggle: () => void;
}) {
    const visualization = parseVisualizationBlock(content);
    const result = useQuery<LccaOutput>({queryKey: ['lcca-query', visualization?.query ?? ''], queryFn: skipToken, gcTime: 0});
    if (!visualization || !result.data || result.isFetching || result.isError) return null;
    return <Button type="button" variant="ghost" size="sm" className={cn('text-muted-foreground', open && 'bg-muted')}
        aria-label={open ? 'Ocultar conjuntos de datos' : 'Ver conjuntos de datos'} aria-expanded={open}
        aria-controls={panelId} title="Conjuntos de datos" onClick={event => {event.stopPropagation(); onToggle();}}>
        <DatabaseIcon className={cn('size-4')}/>
    </Button>;
}
