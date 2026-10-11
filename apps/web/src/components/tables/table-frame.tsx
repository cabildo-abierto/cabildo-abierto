import type {ReactNode} from 'react';
import {TableRows} from './table-rows';
import {ScrollArea} from '@/components/ui/scroll-area';
import {cn} from '@/lib/utils';

export function TableFrame({headers, rows, renderCell, renderHeader, sort, equalColumns = false, overlay}: {
    equalColumns?: boolean; overlay?: ReactNode;
    headers?: ReactNode[]; rows: ReactNode[][]; sort?: {column: number; direction: 'asc' | 'desc'};
    renderCell?: (cell: ReactNode, row: number, column: number) => ReactNode;
    renderHeader?: (cell: ReactNode, column: number) => ReactNode;
}) {
    const columnCount = headers?.length ?? rows[0]?.length ?? 0;
    const cellClassName = cn('border-r border-b border-border px-3 py-2 align-top wrap-anywhere last:border-r-0', !equalColumns && 'min-w-36 max-w-80');
    return <ScrollArea horizontal overlay={overlay} className={cn('w-full min-w-0 rounded-md border', overlay && 'min-h-24')}>
        <table className={cn('w-full border-collapse text-left text-xs', equalColumns && 'table-fixed')} style={equalColumns ? {minWidth: columnCount * 144} : undefined}>
            {equalColumns && <colgroup>{Array.from({length: columnCount}, (_, index) => <col key={index} style={{width: `${100 / columnCount}%`}}/>)}</colgroup>}
            {headers && <thead className={cn('bg-muted')}><tr>{headers.map((cell, index) => <th key={index} scope="col" aria-sort={sort?.column === index ? sort.direction === 'asc' ? 'ascending' : 'descending' : sort ? 'none' : undefined} className={cn(cellClassName, 'font-medium whitespace-normal')}>{renderHeader ? renderHeader(cell, index) : cell}</th>)}</tr></thead>}
            <TableRows rows={rows} cellClassName={cellClassName} renderCell={renderCell}/>
        </table>
    </ScrollArea>;
}
