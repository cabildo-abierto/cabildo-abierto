"use client";

import type {CSSProperties, Ref} from 'react';
import type {DatasetCell, DatasetColumn} from '@cabildo-abierto/api';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import {DatasetTextCell} from './dataset-text-cell';
import type {DatasetCellError} from './dataset-cell-error-dialog';

export function DatasetTableRow({row, columns, index, page, loading, style, rowRef, onError}: {
    row: DatasetCell[]; columns: DatasetColumn[]; index: number; page: number; loading: boolean;
    style: CSSProperties; rowRef: Ref<HTMLTableRowElement>; onError: (error: DatasetCellError) => void;
}) {
    return <tr ref={rowRef} data-index={index} aria-rowindex={page * 100 + index + 2} style={style}
        className={cn('absolute top-0 left-0 grid w-full', !loading && index % 2 === 1 && 'bg-muted/30')}>
        {row.map((cell, columnIndex) => <td key={columns[columnIndex].name} className={cn('min-w-0 border-b px-3 py-2 align-top whitespace-pre-wrap break-words', loading && 'border-transparent', cell.error && 'text-destructive')}>
            <div className={cn(loading && 'invisible')}>{cell.error ? <Button type="button" variant="link" size="xs" className={cn('h-auto p-0 text-destructive')} aria-label={`Ver error en ${columns[columnIndex].name}, fila ${page * 100 + index + 1}`}
                onClick={event => onError({column: columns[columnIndex].name, row: page * 100 + index + 1, message: cell.error!, raw: cell.raw ?? '', trigger: event.currentTarget})}>ERROR</Button>
                : cell.value === null ? <span aria-label="Vacío" className={cn('text-muted-foreground')}>—</span>
                    : typeof cell.value === 'string' ? <DatasetTextCell text={cell.value}/>
                        : typeof cell.value === 'boolean' ? cell.value ? 'true' : 'false' : String(cell.value)}</div>
        </td>)}
    </tr>;
}
