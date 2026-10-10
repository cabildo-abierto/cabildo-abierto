"use client";
import {useQuery} from '@tanstack/react-query';
import type {VisualizationSourcesOutput} from '@cabildo-abierto/api';
import {dataViewRequest,DataViewRequestError} from '@/utils/react/data-view-request';
import {VisualizationSourceCard} from './visualization-source-card';
import {Spinner} from '@/components/ui/spinner';
import {cn} from '@/lib/utils';

export function LccaSourcesPanel({query, id}: {query: string; id?: string}) {
    const result = useQuery({queryKey: ['visualization-sources',query,1],enabled: !!query.trim(),
        queryFn: ({signal}) => dataViewRequest<VisualizationSourcesOutput>('/lcca/sources',{method: 'POST',signal,headers: {'Content-Type':'application/json'},body: JSON.stringify({query,queryLanguageVersion: 1})}),
        retry: false});
    return <section id={id} aria-label="Datos usados" className={cn('min-w-0 space-y-3 rounded-lg border bg-muted/20 p-3')}>
        <h3 className={cn('text-xs font-medium text-muted-foreground')}>Datos usados</h3>
        {result.isPending && !!query.trim() && <div role="status" aria-label="Cargando conjuntos de datos" className={cn('flex justify-center py-3')}><Spinner/></div>}
        {(!query.trim() || result.error) && <p role="alert" className={cn('text-xs text-muted-foreground',result.error instanceof DataViewRequestError && result.error.systemError && 'text-destructive')}>{result.error?.message ?? 'Completá la vista de datos para ver sus conjuntos de datos.'}</p>}
        {result.data && <ul className={cn('space-y-1')}>{result.data.sources.map(source =>
            <li key={JSON.stringify([source.topic.id,source.block.blockNumber])}><VisualizationSourceCard source={source}/></li>
        )}</ul>}
    </section>;
}
