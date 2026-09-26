"use client";

import {useState} from 'react';
import type {DatasetCell, DatasetColumn, DatasetColumnType} from '@cabildo-abierto/api';
import {DATASET_TYPES, DATASET_TYPE_NAMES} from '@cabildo-abierto/utils';
import {Button} from '@/components/ui/button';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {cn} from '@/lib/utils';
import {DatasetDimensions} from './dataset-dimensions';

export function DatasetTable({columns, rows, onTypeChange, fillHeight = false}: {
    columns: DatasetColumn[]; rows: DatasetCell[][];
    onTypeChange?: (index: number, type: DatasetColumnType) => void;
    fillHeight?: boolean;
}) {
    const [page, setPage] = useState(0);
    const pages = Math.max(1, Math.ceil(rows.length / 100));
    const current = Math.min(page, pages - 1);
    return <div className={cn('w-full min-w-0', fillHeight ? 'flex h-full min-h-0 flex-col gap-2' : 'space-y-2')}>
        <ScrollArea horizontal className={cn('w-full max-w-full rounded-md border', fillHeight ? 'min-h-0 flex-1' : 'max-h-[65dvh]')}
            viewportClassName={cn(fillHeight && 'h-full')}>
            <table className={cn('w-full border-collapse text-left text-xs')}>
                <caption className={cn('sr-only')}>Conjunto de datos: {rows.length} filas</caption>
                <thead className={cn('sticky top-0 z-10 bg-muted')}><tr>{columns.map((column, index) => <th key={column.name} scope="col" className={cn('min-w-32 border-b px-3 py-2 align-top')}>
                    <div title={column.name} className={cn('mb-1 max-w-48 truncate font-medium')}>{column.name}</div>
                    {onTypeChange ? <Select value={column.type} onValueChange={value => { if (value) onTypeChange(index, value as DatasetColumnType); }}>
                        <SelectTrigger size="sm" aria-label={`Tipo de ${column.name}`}><SelectValue>{DATASET_TYPE_NAMES[column.type]}</SelectValue></SelectTrigger>
                        <SelectContent data-attachment-editor-popup>{DATASET_TYPES.map(type => <SelectItem key={type} value={type}>{DATASET_TYPE_NAMES[type]}</SelectItem>)}</SelectContent>
                    </Select> : <span className={cn('font-normal text-muted-foreground')}>{DATASET_TYPE_NAMES[column.type]}</span>}
                </th>)}</tr></thead>
                <tbody>{rows.slice(current * 100, (current + 1) * 100).map((row, rowIndex) => <tr key={current * 100 + rowIndex} className={cn('even:bg-muted/30')}>
                    {row.map((cell, index) => <td key={columns[index].name} className={cn('max-w-80 border-b px-3 py-2 align-top whitespace-pre-wrap break-words', cell.error && 'text-destructive')}>
                        {cell.error ? <details><summary className={cn('cursor-pointer font-medium')}>ERROR</summary><span className={cn('block text-muted-foreground')}>{cell.error}<br/>Valor original: {cell.raw || '(ausente)'}</span></details>
                            : cell.value === null ? <span aria-label="Vacío" className={cn('text-muted-foreground')}>—</span>
                                : typeof cell.value === 'boolean' ? cell.value ? 'true' : 'false' : String(cell.value)}
                    </td>)}
                </tr>)}</tbody>
            </table>
        </ScrollArea>
        <div className={cn('flex shrink-0 flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground')}>
            <span><DatasetDimensions rowCount={rows.length} columnCount={columns.length}/> · Página {current + 1} de {pages}</span>
            <div className={cn('flex gap-2')}>
                <Button type="button" variant="outline" size="sm" disabled={current === 0} onClick={() => setPage(current - 1)}>Anterior</Button>
                <Button type="button" variant="outline" size="sm" disabled={current + 1 >= pages} onClick={() => setPage(current + 1)}>Siguiente</Button>
            </div>
        </div>
    </div>;
}
