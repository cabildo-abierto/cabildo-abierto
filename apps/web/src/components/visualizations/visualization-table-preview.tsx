import {memo} from 'react';
import type {TableChart, TypedTable} from '@cabildo-abierto/api';
import {formatTableValue} from '@cabildo-abierto/utils';
import {cn} from '@/lib/utils';

export const VisualizationTablePreview = memo(function VisualizationTablePreview({chart, table}: {chart: TableChart; table: TypedTable}) {
    const columns = chart.columns.slice(0, 3);
    const indices = columns.map(column => table.columns.findIndex(candidate => candidate.name === column.field));
    return <div className={cn('space-y-2')}>
        <table className={cn('w-full table-fixed border-collapse text-left text-[10px]')}>
            <thead><tr>{columns.map(column => <th key={column.field} scope="col" className={cn('truncate border-b px-1 py-1 font-medium')}>{column.label ?? column.field}</th>)}</tr></thead>
            <tbody>{table.rows.slice(0, 3).map((row, i) => <tr key={i}>{columns.map((column, j) => <td key={column.field} className={cn('truncate border-b px-1 py-1 text-muted-foreground')}>{formatTableValue(row[indices[j]], column.format)}</td>)}</tr>)}</tbody>
        </table>
        <p className={cn('text-[10px] text-muted-foreground')}>{table.rows.length.toLocaleString('es-AR')} filas · {chart.columns.length.toLocaleString('es-AR')} columnas</p>
    </div>;
});
