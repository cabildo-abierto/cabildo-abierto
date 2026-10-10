"use client";

import type {DatasetCell, DatasetColumn, DatasetColumnType} from '@cabildo-abierto/api';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import {DatasetDimensions} from './dataset-dimensions';
import {DatasetVirtualTable} from './dataset-virtual-table';

export function DatasetTable({columns, rows, rowCount, page, onPageChange, onTypeChange, fillHeight = false, loading = false}: {
    columns: DatasetColumn[]; rows: DatasetCell[][]; rowCount: number; page: number; onPageChange: (page:number)=>void;
    onTypeChange?: (index: number, type: DatasetColumnType) => void;
    fillHeight?: boolean; loading?: boolean;
}) {
    const pages = Math.max(1, Math.ceil(rowCount / 100));
    const current = Math.min(page, pages - 1);
    return <div className={cn('w-full min-w-0', fillHeight ? 'flex h-full min-h-0 flex-col gap-2' : 'space-y-2')}>
        <span role="status" className={cn('sr-only')}>{loading ? 'Cargando página' : ''}</span>
        <DatasetVirtualTable key={current} columns={columns} rows={rows} rowCount={rowCount} page={current}
            onTypeChange={onTypeChange} fillHeight={fillHeight} loading={loading}/>
        <div className={cn('flex shrink-0 flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground')}>
            <span><DatasetDimensions rowCount={rowCount} columnCount={columns.length}/> · Página {current + 1} de {pages}</span>
            <div className={cn('flex gap-2')}>
                <Button type="button" variant="outline" size="sm" disabled={loading || current === 0} onClick={() => onPageChange(current - 1)}>Anterior</Button>
                <Button type="button" variant="outline" size="sm" disabled={loading || current + 1 >= pages} onClick={() => onPageChange(current + 1)}>Siguiente</Button>
            </div>
        </div>
    </div>;
}
