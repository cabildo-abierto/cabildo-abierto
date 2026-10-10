"use client";

import {useLayoutEffect, useRef, useState} from 'react';
import {useVirtualizer} from '@tanstack/react-virtual';
import type {DatasetCell, DatasetColumn, DatasetColumnType} from '@cabildo-abierto/api';
import {DATASET_TYPES, DATASET_TYPE_NAMES} from '@cabildo-abierto/utils';
import {Spinner} from '@/components/ui/spinner';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {cn} from '@/lib/utils';
import {DatasetTableRow} from './dataset-table-row';
import {DatasetCellErrorDialog, type DatasetCellError} from './dataset-cell-error-dialog';

export function DatasetVirtualTable({columns, rows, rowCount, page, onTypeChange, fillHeight, loading}: {
    columns: DatasetColumn[]; rows: DatasetCell[][]; rowCount: number; page: number;
    onTypeChange?: (index: number, type: DatasetColumnType) => void; fillHeight: boolean; loading: boolean;
}) {
    const viewportRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLTableSectionElement>(null);
    const [headerHeight, setHeaderHeight] = useState(0);
    const [error, setError] = useState<DatasetCellError | null>(null);
    const virtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
        count: rows.length,
        getScrollElement: () => viewportRef.current,
        estimateSize: () => 96,
        overscan: 3,
        scrollMargin: headerHeight,
        useAnimationFrameWithResizeObserver: true,
    });
    useLayoutEffect(() => {
        const header = headerRef.current;
        if (!header) return;
        const measure = () => setHeaderHeight(header.getBoundingClientRect().height);
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(header);
        return () => observer.disconnect();
    }, []);
    useLayoutEffect(() => {
        virtualizer.scrollToOffset(0);
    }, [rows, virtualizer]);
    // Shared widths keep columns aligned regardless of which rows are mounted.
    const gridTemplateColumns = `repeat(${Math.max(1, columns.length)}, minmax(12rem, 1fr))`;
    return <>
        <ScrollArea horizontal viewportRef={viewportRef}
            className={cn('w-full max-w-full rounded-md border', fillHeight ? 'min-h-0 flex-1' : 'max-h-[65dvh]')}
            viewportClassName={cn('[overflow-anchor:none]', fillHeight && 'h-full')}
            overlay={loading && <div className={cn('pointer-events-none absolute inset-0 z-20 flex items-center justify-center text-muted-foreground')}><Spinner aria-hidden="true" className={cn('size-7')}/></div>}>
            <table aria-rowcount={rowCount + 1} aria-colcount={columns.length} className={cn('grid w-full text-left text-xs')} style={{minWidth: `${columns.length * 12}rem`}}>
                <caption className={cn('sr-only')}>Conjunto de datos: {rowCount} filas</caption>
                <thead ref={headerRef} className={cn('sticky top-0 z-10 grid bg-muted')}>
                    <tr className={cn('grid')} style={{gridTemplateColumns}}>{columns.map((column, index) => <th key={column.name} scope="col" className={cn('min-w-0 border-b px-3 py-2 text-left')}>
                        <div title={column.name} className={cn('mb-1 truncate font-medium')}>{column.name}</div>
                        {onTypeChange ? <Select value={column.type} onValueChange={value => { if (value) onTypeChange(index, value as DatasetColumnType); }}>
                            <SelectTrigger size="sm" aria-label={`Tipo de ${column.name}`}><SelectValue>{DATASET_TYPE_NAMES[column.type]}</SelectValue></SelectTrigger>
                            <SelectContent data-attachment-editor-popup>{DATASET_TYPES.map(type => <SelectItem key={type} value={type}>{DATASET_TYPE_NAMES[type]}</SelectItem>)}</SelectContent>
                        </Select> : <span className={cn('font-normal text-muted-foreground')}>{DATASET_TYPE_NAMES[column.type]}</span>}
                    </th>)}</tr>
                </thead>
                <tbody aria-busy={loading} aria-hidden={loading || undefined} className={cn('relative block')} style={{height: virtualizer.getTotalSize()}}>
                    {virtualizer.getVirtualItems().map(item => <DatasetTableRow key={item.key} rowRef={virtualizer.measureElement}
                        index={item.index} row={rows[item.index]} columns={columns} page={page} loading={loading} onError={setError}
                        style={{gridTemplateColumns, transform: `translateY(${item.start - headerHeight}px)`}}/>)}
                </tbody>
            </table>
        </ScrollArea>
        {error && <DatasetCellErrorDialog error={error} onClose={() => setError(null)} fallbackFocus={viewportRef.current}/>}
    </>;
}
