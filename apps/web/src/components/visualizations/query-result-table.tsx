"use client";
import {useState} from 'react';
import type {TypedTable} from '@cabildo-abierto/api';
import {formatTableValue} from '@cabildo-abierto/utils';
import {DatasetTextCell} from '@/components/datasets/dataset-text-cell';
import {TableFrame} from '@/components/tables/table-frame';
import {TablePagination} from '@/components/tables/table-pagination';
import {cn} from '@/lib/utils';

export function QueryResultTable({table}: {table: TypedTable}) {
    const [page, setPage] = useState(0);
    const pageSize = 25;
    const current = Math.min(page, Math.max(0, Math.ceil(table.rows.length / pageSize) - 1));
    return <div className={cn('min-w-0 space-y-2')}>
        <TableFrame headers={table.columns.map(column => column.name)} rows={table.rows.slice(current * pageSize, (current + 1) * pageSize).map(row => row.map(value => <DatasetTextCell text={formatTableValue(value)}/>))}/>
        <TablePagination page={current} pageSize={pageSize} rowCount={table.rows.length} columnCount={table.columns.length} onPageChange={setPage}/>
    </div>;
}
