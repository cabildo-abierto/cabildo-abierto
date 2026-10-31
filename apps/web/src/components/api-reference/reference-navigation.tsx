"use client";

import {useState, type MouseEvent} from 'react';
import {MagnifyingGlassIcon} from '@phosphor-icons/react';
import {Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger} from '@/components/ui/accordion';
import {Input} from '@/components/ui/input';
import {cn} from '@/lib/utils';
import type {Endpoint} from './openapi';

function normalize(value: string) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function ReferenceNavigation({endpoints, selectedId, baseUrl, onSelect}: {
    endpoints: Endpoint[]; selectedId?: string; baseUrl: string;
    onSelect: (event: MouseEvent<HTMLAnchorElement>, id: string) => void;
}) {
    const [search, setSearch] = useState('');
    const terms = normalize(search).trim().split(/\s+/).filter(Boolean);
    const filtered = endpoints.filter(endpoint => {
        const text = normalize([endpoint.method, endpoint.path, endpoint.operation.summary, endpoint.operation.operationId,
            endpoint.operation.description, ...(endpoint.operation.tags ?? [])].join(' '));
        return terms.every(term => text.includes(term));
    });
    const groups = [...new Set(filtered.map(endpoint => endpoint.operation.tags?.[0] ?? 'General'))];
    const selected = endpoints.find(endpoint => endpoint.id === selectedId);
    const selectedGroup = selected?.operation.tags?.[0] ?? 'General';
    const expansionKey = terms.length ? `search:${terms.join(' ')}` : selectedGroup;
    const [expansion, setExpansion] = useState<{key: string; groups: string[]}>({key: '', groups: []});
    const expanded = expansion.key === expansionKey ? expansion.groups : terms.length ? groups : [selectedGroup];
    return <nav aria-label="Referencia de la API" className={cn('space-y-5')}>
        <div className={cn('relative')}>
            <MagnifyingGlassIcon aria-hidden="true" className={cn('pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground')}/>
            <Input type="search" aria-label="Buscar operaciones de la API" placeholder="Buscar operaciones…" value={search}
                onChange={event => setSearch(event.target.value)} className={cn('pl-9 text-xs')}/>
        </div>
        <p aria-live="polite" className={cn('px-3 text-[10px] uppercase tracking-widest text-muted-foreground')}>
            {terms.length ? `${filtered.length} de ${endpoints.length} operaciones` : `${endpoints.length} ${endpoints.length === 1 ? 'operación' : 'operaciones'}`}
        </p>
        <Accordion multiple value={expanded} onValueChange={groups => setExpansion({key: expansionKey, groups})} className={cn('space-y-1')}>
            {groups.map(group => <AccordionItem key={group} value={group}>
                <AccordionHeader render={<h3/>}>
                    <AccordionTrigger className={cn('min-h-9 justify-between rounded-md px-3 py-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground hover:bg-muted/60 [&>svg]:size-3.5 motion-reduce:[&>svg]:transition-none')}>
                        {group}
                    </AccordionTrigger>
                </AccordionHeader>
                <AccordionContent className={cn('overflow-hidden [&>div]:space-y-1 [&>div]:pb-1 [&>div]:pt-1')}>
                    {filtered.filter(endpoint => (endpoint.operation.tags?.[0] ?? 'General') === group).map(endpoint => <a key={endpoint.id} href={`#${encodeURIComponent(endpoint.id)}`}
                        onClick={event => onSelect(event, endpoint.id)} aria-current={selectedId === endpoint.id ? 'page' : undefined}
                        className={cn('flex items-center gap-3 rounded-md px-3 py-2.5 text-xs transition-colors hover:bg-muted focus-visible:outline-ring', selectedId === endpoint.id && 'bg-muted font-medium')}>
                        <span className={cn('min-w-8 shrink-0 text-[10px] text-muted-foreground', endpoint.method === 'get' && 'text-emerald-700 dark:text-emerald-400')}>{endpoint.method.toUpperCase()}</span>
                        <span className={cn('min-w-0 break-words leading-tight')}>{endpoint.operation.summary ?? endpoint.operation.operationId ?? endpoint.path}</span>
                    </a>)}
                </AccordionContent>
            </AccordionItem>)}
        </Accordion>
        {!filtered.length && <p className={cn('px-3 text-xs text-muted-foreground')}>No encontramos operaciones para esa búsqueda.</p>}
        <div className={cn('mx-3 border-t border-border pt-4')}>
            <p className={cn('text-[10px] uppercase tracking-widest text-muted-foreground')}>URL base</p>
            <code className={cn('mt-2 block break-all text-[11px] leading-5 text-muted-foreground')}>{baseUrl}</code>
        </div>
    </nav>;
}
