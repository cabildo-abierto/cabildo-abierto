"use client";

import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import type {ContentSearchOutput, SearchTopicsOutput} from '@cabildo-abierto/api';
import {XIcon} from '@phosphor-icons/react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Spinner} from '@/components/ui/spinner';
import {TopicSearchResult} from '@/components/topic-search-result';
import {get} from '@/utils/react/fetch';
import {useDebounce} from '@/utils/react/debounce';
import {cn} from '@/lib/utils';

export function HomeSearch() {
    const [search, setSearch] = useState('');
    const [offset, setOffset] = useState(0);
    const query = useDebounce(search.trim(), 250);
    const limit = 20;
    const topicsQuery = useQuery({
        queryKey: ['topics', 'home'], enabled: !query,
        queryFn: async () => {
            const result = await get<SearchTopicsOutput>('/topics');
            if ('error' in result) throw new Error(result.error);
            return result.value.topics;
        },
    });
    const searchQuery = useQuery({
        queryKey: ['content-search', query, 'all-versions', offset], enabled: !!query,
        queryFn: async () => {
            const params = new URLSearchParams({q: query, history: 'true', comments: 'true', offset: String(offset), limit: String(limit)});
            const result = await get<ContentSearchOutput>(`/search?${params}`);
            if ('error' in result) throw new Error(result.error);
            return result.value;
        },
    });
    const activeQuery = query ? searchQuery : topicsQuery;
    const loading = activeQuery.isFetching;
    const error = activeQuery.error instanceof Error ? activeQuery.error.message : null;
    const results = searchQuery.data;
    const topics = topicsQuery.data ?? [];
    const empty = query ? !results?.results.length : !topics.length;
    return <main className={cn('mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col px-4 pt-10 pb-8 sm:px-6 sm:pt-14')}>
        <section className={cn('mx-auto flex w-full max-w-xl animate-in flex-col gap-4 fade-in-0 slide-in-from-top-2 duration-500 motion-reduce:animate-none')}>
            <h1 className={cn('text-center text-2xl font-semibold')}>Cabildo Abierto</h1>
            <div className={cn('relative')}>
                <Input type="text" inputMode="search" autoComplete="off" maxLength={500} value={search}
                    onChange={event => { setSearch(event.target.value); setOffset(0); }} placeholder="Buscá en Cabildo Abierto…"
                    className={cn('w-full pr-9')} aria-label="Buscar en temas, documentos, conjuntos de datos y comentarios"/>
                {search && <Button type="button" variant="ghost" size="icon-xs" className={cn('absolute top-1/2 right-2 -translate-y-1/2 rounded-full text-muted-foreground')}
                    onClick={() => { setSearch(''); setOffset(0); }} aria-label="Limpiar búsqueda" title="Limpiar búsqueda"><XIcon weight="bold"/></Button>}
            </div>
        </section>
        <section className={cn('mt-8 w-full space-y-4')} aria-live="polite" aria-busy={loading}>
            {loading && <div className={cn('flex justify-center')}><Spinner className={cn('size-8')}/></div>}
            {error && <p className={cn('text-center text-sm text-destructive')}>{error}</p>}
            {!loading && !error && empty && <p className={cn('text-center text-sm text-muted-foreground')}>{query ? 'No encontramos resultados para esta búsqueda.' : 'Todavía no hay temas.'}</p>}
            {!error && !empty && <ul className={cn('grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3')}>
                {query ? results?.results.map(result => <li key={result.topic.id}><TopicSearchResult result={result}/></li>)
                    : topics.map(topic => <li key={topic.id}><TopicSearchResult topic={topic}/></li>)}
            </ul>}
            {query && results && results.totalTopics > limit && <div className={cn('flex items-center justify-center gap-3')}>
                <Button variant="outline" size="sm" disabled={!offset || loading} onClick={() => setOffset(value => Math.max(0, value - limit))}>Anterior</Button>
                <span className={cn('text-xs text-muted-foreground')}>{Math.floor(offset / limit) + 1} / {Math.ceil(results.totalTopics / limit)}</span>
                <Button variant="outline" size="sm" disabled={offset + limit >= results.totalTopics || loading} onClick={() => setOffset(value => value + limit)}>Siguiente</Button>
            </div>}
        </section>
    </main>;
}
