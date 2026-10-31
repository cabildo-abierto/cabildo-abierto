import type {TopicConnectionCounts} from '@cabildo-abierto/api';
import {EyeIcon, PencilSimpleIcon} from '@phosphor-icons/react';
import {cn} from '@/lib/utils';

export function TopicConnectionSummary({connections, hideZero = false, className}: {
    connections: TopicConnectionCounts; hideZero?: boolean; className?: string;
}) {
    const reading = !hideZero || connections.reading > 0;
    const editing = !hideZero || connections.editing > 0;
    if (!reading && !editing) return null;
    return <div className={cn('flex shrink-0 flex-wrap items-center gap-2 text-xs text-muted-foreground', className)} aria-live="polite">
        {reading && <span className={cn('inline-flex items-center gap-1 whitespace-nowrap')} title={`${connections.reading} leyendo`}>
            <EyeIcon className={cn('size-3.5 shrink-0')}/>{connections.reading} leyendo
        </span>}
        {reading && editing && <span aria-hidden="true">·</span>}
        {editing && <span className={cn('inline-flex items-center gap-1 whitespace-nowrap')} title={`${connections.editing} editando`}>
            <PencilSimpleIcon className={cn('size-3.5 shrink-0')}/>{connections.editing} editando
        </span>}
    </div>;
}
