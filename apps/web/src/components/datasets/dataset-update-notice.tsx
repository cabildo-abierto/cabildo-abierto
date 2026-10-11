"use client";

import type {DatasetUpdate} from '@cabildo-abierto/api';
import {Button} from '@/components/ui/button';
import {Spinner} from '@/components/ui/spinner';
import {cn} from '@/lib/utils';

export function DatasetUpdateNotice({update, error, snapshotId, onReload, loading}: {
    update?: DatasetUpdate; error: Error | null; snapshotId: string; onReload: () => void; loading: boolean;
}) {
    const failure = error?.message ?? (update?.state === 'failed' ? update.error ?? 'No pudimos actualizar el conjunto de datos.' : null);
    const active = !failure && (update?.state === 'checking' || update?.state === 'preparing');
    const available = update?.state === 'ready' && !!update.snapshotId && update.snapshotId !== snapshotId;
    if (!failure && !active && !available) return null;
    return <div role={failure ? 'alert' : 'status'} className={cn('flex shrink-0 flex-wrap items-center gap-2 rounded-md border p-2 text-xs', failure ? 'text-destructive' : 'text-muted-foreground')}>
        {active && <Spinner className={cn('size-3')} aria-hidden="true"/>}
        <p className={cn('min-w-0 flex-1')}>{failure ? <>Se conserva la última versión guardada. {failure}</>
            : active ? 'Mostrando la última versión guardada. Actualizando…' : 'Hay una nueva versión disponible.'}</p>
        {(failure || available) && <Button type="button" variant="outline" size="sm" disabled={loading} onClick={onReload}>
            {available && !failure ? 'Cargar versión actualizada' : 'Reintentar actualización'}
        </Button>}
    </div>;
}
