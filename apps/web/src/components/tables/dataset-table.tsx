"use client";
import {useMemo} from 'react';
import type {DatasetTableContent} from '@cabildo-abierto/api';
import {ArrowDownIcon, ArrowUpIcon} from '@phosphor-icons/react';
import {useTablePage} from '@/hooks/use-table-page';
import {TablePagination} from './table-pagination';
import {TableFrame} from './table-frame';
import {TableSearch} from './table-search';
import {Button} from '@/components/ui/button';
import {Spinner} from '@/components/ui/spinner';
import {DatasetUpdateNotice} from '@/components/datasets/dataset-update-notice';
import {DatasetTextCell} from '@/components/datasets/dataset-text-cell';
import {cn} from '@/lib/utils';

export function DatasetTable({value}: {value: DatasetTableContent}) {
    const query = useTablePage(value);
    const data = query.data;
    const rows = useMemo(() => data?.rows.map(row => row.map(cell => <span title={cell.error ?? undefined} className={cn(cell.error && 'text-destructive')}><DatasetTextCell text={cell.raw}/></span>)) ?? [], [data?.rows]);
    return <div className={cn('min-w-0 space-y-2')}>
        {data && <DatasetUpdateNotice update={query.update} error={query.updateError} snapshotId={data.snapshotId} onReload={query.reload} loading={query.loading}/>}
        {query.error && <div role="alert" className={cn('flex items-center gap-2 text-xs text-destructive')}><span>{query.error.message}</span><Button type="button" size="sm" variant="outline" disabled={query.loading} onClick={query.reload}>Reintentar</Button></div>}
        {query.loading && <p role="status" className={cn('flex items-center gap-2 text-xs text-muted-foreground')}><Spinner className={cn('size-3')}/>{data ? 'Actualizando…' : 'Cargando tabla…'}</p>}
        {data && <>
            <TableFrame
                sort={query.order ? {column: value.columns.findIndex(column => column.field === query.order!.field), direction: query.order.direction} : undefined} headers={value.columns.map(column => column.label || column.field)}
                renderHeader={(label, index) => <button type="button" disabled={query.loading} className={cn('flex w-full items-start gap-1 text-left')} title={`Ordenar por ${String(label)}`} onClick={() => query.sort(value.columns[index].field)}>
                    <span className={cn('min-w-0 flex-1')}>{label}</span>{query.order?.field === value.columns[index].field && (query.order.direction === 'asc' ? <ArrowUpIcon className={cn('shrink-0')}/> : <ArrowDownIcon className={cn('shrink-0')}/>)}</button>}
                rows={rows}/>
            {!data.rows.length && <p className={cn('py-3 text-center text-xs text-muted-foreground')}>No hay filas que coincidan.</p>}
            <TablePagination page={data.page} pageSize={value.pageSize} rowCount={data.rowCount} columnCount={value.columns.length} onPageChange={query.page} loading={query.loading}>
                {data.totalRows > value.pageSize && <TableSearch value={query.search} onChange={query.searchFor}/>}
            </TablePagination>
        </>}
    </div>;
}
