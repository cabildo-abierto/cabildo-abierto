"use client";

import {TextWithLinks} from "@/components/ui/text-with-links";
import {useDataset} from '@/hooks/use-dataset';
import {Spinner} from '@/components/ui/spinner';
import {Button} from '@/components/ui/button';
import {BackToTopicButton} from '@/components/back-to-topic-button';
import {cn} from '@/lib/utils';
import {DatasetTable} from './dataset-table';

export function DatasetPage({versionId, inWindow = false}: {versionId: string; inWindow?: boolean}) {
    const query = useDataset(versionId);
    if (query.isFetching && !query.data) return <div className={cn('flex items-center justify-center p-6 text-muted-foreground', inWindow ? 'h-full' : 'min-h-[75dvh]')}><Spinner aria-label="Cargando conjunto de datos" className={cn('size-7')}/></div>;
    if (!query.data || query.isError) return <div className={cn('space-y-3 p-6')}>
        <p role="alert" className={cn('text-sm text-destructive')}>{query.error?.message ?? 'No encontramos el conjunto de datos.'}</p>
        <Button variant="outline" size="sm" onClick={() => query.reload()}>Reintentar</Button>
    </div>;
    return <article className={cn('min-w-0', inWindow ? 'flex h-full min-h-0 flex-col p-3' : 'space-y-4 p-6')}>
        {!inWindow && <header className={cn('space-y-3')}>
            <BackToTopicButton href={`/tema/${encodeURIComponent(query.data.topic.slug)}`}/>
            <h1 className={cn('text-2xl font-semibold')}>{query.data.title}</h1>
            {query.data.description && <p className={cn('whitespace-pre-wrap text-sm text-muted-foreground')}><TextWithLinks text={query.data.description}/></p>}
        </header>}
        <DatasetTable columns={query.data.columns} rows={query.data.rows} rowCount={query.data.rowCount} page={query.page} loading={query.isFetching} onPageChange={query.setPage} fillHeight={inWindow}/>
    </article>;
}
