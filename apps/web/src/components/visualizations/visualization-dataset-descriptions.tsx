"use client";

import {TextWithLinks} from "@/components/ui/text-with-links";
import {useQueries} from '@tanstack/react-query';
import type {DatasetMetadata, LccaOutput} from '@cabildo-abierto/api';
import {dataViewRequest} from '@/utils/react/data-view-request';
import {cn} from '@/lib/utils';

export function VisualizationDatasetDescriptions({sources}: {sources: LccaOutput['sources']}) {
    const versionIds = [...new Set(sources.map(source => source.versionId))];
    const queries = useQueries({queries: versionIds.map(versionId => ({
        queryKey: ['dataset-metadata', versionId],
        queryFn: () => dataViewRequest<DatasetMetadata>(`/dataset-versions/${encodeURIComponent(versionId)}/metadata`),
        staleTime: 300000,
        retry: false,
    }))});
    return queries.map((query, index) => query.data?.description?.trim() && <section key={versionIds[index]} className={cn('mt-3 space-y-1')}>
        <h4 className={cn('text-xs font-medium')}>{versionIds.length > 1 ? query.data.title : 'Descripción'}</h4>
        <p className={cn('text-xs leading-relaxed whitespace-pre-wrap break-words text-muted-foreground')}><TextWithLinks text={query.data.description}/></p>
    </section>);
}
