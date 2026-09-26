"use client";
import {useRef} from 'react';
import type {DatasetSource} from '@cabildo-abierto/api';
import {lccaDatasetReference} from '@cabildo-abierto/utils';
import {Textarea} from '@/components/ui/textarea';
import {cn} from '@/lib/utils';
import {DatasetSourceSelect} from './dataset-source-select';
import {LccaSyntax} from './lcca-syntax';

export function LccaQueryEditor({topicId, query, onChange}: {topicId: string; query: string; onChange: (query: string) => void}) {
    const input = useRef<HTMLTextAreaElement>(null);
    const highlighted = useRef<HTMLPreElement>(null);
    const selection = useRef<{start: number; end: number} | null>(null);
    const insertSource = (source: DatasetSource) => {
        const reference = lccaDatasetReference(source.topicId, source.blockNumber);
        const start = Math.min(selection.current?.start ?? query.length,query.length);
        const end = Math.min(selection.current?.end ?? start,query.length);
        const before = query.slice(0,start), after = query.slice(end);
        const insertion = !query.trim() ? `SELECCIONAR *\nDESDE ${reference}`
            : (before && !/[\s(,]$/.test(before) ? ' ' : '')+reference+(after && !/^[\s),;]/.test(after) ? ' ' : '');
        const next = !query.trim() ? insertion : before+insertion+after;
        const cursor = !query.trim() ? insertion.length : start+insertion.length;
        selection.current = {start: cursor,end: cursor};
        onChange(next);
        requestAnimationFrame(() => {
            input.current?.focus();
            input.current?.setSelectionRange(cursor,cursor);
        });
    };
    return <div className={cn('min-w-0 space-y-3')}>
        <div className={cn('relative min-w-0 rounded-md bg-input/20 dark:bg-input/30')}>
            <pre ref={highlighted} aria-hidden="true" className={cn('pointer-events-none absolute inset-0 m-0 overflow-hidden rounded-md border border-transparent px-2 py-2 font-mono text-xs leading-5 whitespace-pre-wrap break-words text-foreground [scrollbar-gutter:stable]')}>
                <LccaSyntax query={query}/>{'\n'}
            </pre>
            <Textarea ref={input} aria-label="Consulta LCCA" spellCheck={false} autoCapitalize="off" autoCorrect="off"
                className={cn('relative h-64 min-h-48 field-sizing-fixed bg-transparent font-mono text-xs leading-5 text-transparent caret-foreground selection:bg-primary/20 [scrollbar-gutter:stable] md:text-xs md:leading-5 dark:bg-transparent')}
                placeholder="SELECCIONAR * DESDE datos('tema', 'ds-1')" value={query}
                onChange={event => onChange(event.target.value)}
                onSelect={event => { selection.current = {start: event.currentTarget.selectionStart,end: event.currentTarget.selectionEnd}; }}
                onScroll={event => {
                    if (!highlighted.current) return;
                    highlighted.current.scrollTop = event.currentTarget.scrollTop;
                    highlighted.current.scrollLeft = event.currentTarget.scrollLeft;
                }}/>
        </div>
        <DatasetSourceSelect topicId={topicId} value={null} label="Insertar conjunto de datos" placeholder="Buscar por título…" onChange={insertSource}/>
    </div>;
}
