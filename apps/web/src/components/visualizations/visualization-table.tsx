import {memo, useState} from 'react';
import type {TableChart, TypedTable} from '@cabildo-abierto/api';
import {formatTableValue} from '@cabildo-abierto/utils';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
export const VisualizationTable = memo(function VisualizationTable({chart, table, aspectRatio, showDimensions = true}: {chart: TableChart; table: TypedTable; aspectRatio: number; showDimensions?: boolean}) {
    const [page, setPage] = useState(0);
    const size = chart.pageSize ?? 25, pages = Math.max(1,Math.ceil(table.rows.length/size));
    const current = Math.min(page,pages-1);
    const indices = chart.columns.map(column => table.columns.findIndex(c => c.name === column.field));
    return <div className={cn('min-w-0 space-y-2')}>
        <ScrollArea horizontal className={cn('w-full rounded-md border')} style={{aspectRatio}} viewportClassName={cn('h-full')}>
            <table className={cn('w-full border-collapse text-left text-xs')}>
                <thead className={cn('sticky top-0 z-10 bg-muted')}><tr>{chart.columns.map(column => <th key={column.field} scope="col" title={column.label ?? column.field} className={cn('max-w-48 truncate border-b px-3 py-2')}>{column.label ?? column.field}</th>)}</tr></thead>
                <tbody>{table.rows.slice(current*size,(current+1)*size).map((row,i) => <tr key={i} className={cn('even:bg-muted/30')}>{chart.columns.map((column,j) => <td key={column.field} className={cn('max-w-80 border-b px-3 py-2 break-words')}>{formatTableValue(row[indices[j]],column.format)}</td>)}</tr>)}</tbody>
            </table>
        </ScrollArea>
        <div className={cn('flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground')}><span>{showDimensions && <>{table.rows.length} filas · {chart.columns.length} columnas · </>}{current+1}/{pages}</span><div className={cn('flex gap-2')}><Button type="button" size="sm" variant="outline" disabled={!current} onClick={() => setPage(current-1)}>Anterior</Button><Button type="button" size="sm" variant="outline" disabled={current+1>=pages} onClick={() => setPage(current+1)}>Siguiente</Button></div></div>
    </div>;
});
