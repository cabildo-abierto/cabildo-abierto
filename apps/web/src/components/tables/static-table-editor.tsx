"use client";
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {EyeIcon, EyeSlashIcon} from '@phosphor-icons/react';
import type {StaticTableContent} from '@cabildo-abierto/api';
import {isRichTextEmpty} from '@cabildo-abierto/utils';
import {Button} from '@/components/ui/button';
import {NumberInput} from '@/components/ui/number-input';
import {EditableTableCell} from './editable-table-cell';
import {useTopicFootnotes, useStableFootnoteNumbers} from '@/hooks/use-topic-footnotes';
import {TopicFootnoteList} from '@/components/rich-text/topic-footnote-list';
import {TableFrame} from './table-frame';
import {TableChangeConfirmation} from './table-change-confirmation';
import {cn} from '@/lib/utils';

export function StaticTableEditor({value, topicId, onChange, inline = false, disabled = false, footnoteNumbers}: {
    value: StaticTableContent; topicId: string; onChange: (value: StaticTableContent) => void | boolean;
    inline?: boolean; disabled?: boolean; footnoteNumbers?: ReadonlyMap<string, number>;
}) {
    const container = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState<string | null>(null);
    const [pending, setPending] = useState<StaticTableContent | null>(null);
    const [dimensions, setDimensions] = useState<{rows: number | null; columns: number | null}>({rows: value.rows.length, columns: value.headers.length});
    useEffect(() => {
        if (!inline) return;
        const deactivate = (event: Event) => {
            const target = event.target;
            if (!(target instanceof Element) || container.current?.contains(target)
                || target.closest('[data-attachment-editor-popup], [data-slot="select-content"]')) return;
            setActive(null);
        };
        document.addEventListener('pointerdown', deactivate);
        document.addEventListener('focusin', deactivate);
        return () => {
            document.removeEventListener('pointerdown', deactivate);
            document.removeEventListener('focusin', deactivate);
        };
    }, [inline]);
    const noteBlocks = useMemo(() => footnoteNumbers ? [] : [{typeId: 'tabla' as const, content: JSON.stringify(value)}], [value, footnoteNumbers]);
    const notes = useTopicFootnotes(noteBlocks);
    const numbers = useStableFootnoteNumbers(footnoteNumbers ?? notes.numberById);
    const latest = useRef({value, onChange});
    latest.current = {value, onChange};
    const activateCell = useCallback((row: number, column: number) => setActive(`${row}:${column}`), []);
    const updateCell = useCallback((row: number, column: number, content: string) => {
        const {value, onChange} = latest.current;
        return onChange(row < 0 ? {...value, headers: value.headers.map((cell, c) => c === column ? content : cell)}
            : {...value, rows: value.rows.map((cells, r) => r === row ? cells.map((cell, c) => c === column ? content : cell) : cells)});
    }, []);
    const resize = () => {
        const {rows, columns} = dimensions;
        if (rows === null || columns === null || !Number.isInteger(rows) || rows < 1 || rows > 100 || !Number.isInteger(columns) || columns < 1 || columns > 20) return;
        const next: StaticTableContent = {...value, headers: Array.from({length: columns}, (_, c) => value.headers[c] ?? ''),
            rows: Array.from({length: rows}, (_, r) => Array.from({length: columns}, (_, c) => value.rows[r]?.[c] ?? ''))};
        const discarded = [...value.headers.slice(columns), ...value.rows.flatMap((row, r) => r >= rows ? row : row.slice(columns))];
        if (discarded.some(cell => !isRichTextEmpty(cell))) setPending(next);
        else {setActive(null); onChange(next);}
    };
    const render = useCallback((content: string, row: number, column: number) => <EditableTableCell
        content={content} row={row} column={column} active={active === `${row}:${column}`} disabled={disabled}
        topicId={topicId} footnoteNumbers={numbers} onActivate={activateCell} onUpdate={updateCell}/>,
    [active, disabled, topicId, numbers, activateCell, updateCell]);
    return <div ref={container} className={cn('space-y-3')}>
        {!inline && <>
            <div className={cn('flex flex-wrap items-end gap-2')}>
                <label className={cn('grid gap-1 text-xs')}>Filas<NumberInput min={1} max={100} value={dimensions.rows} onValueChange={rows => setDimensions({...dimensions, rows})}/></label>
                <label className={cn('grid gap-1 text-xs')}>Columnas<NumberInput min={1} max={20} value={dimensions.columns} onValueChange={columns => setDimensions({...dimensions, columns})}/></label>
                <Button type="button" variant="outline" size="sm" disabled={dimensions.rows === null || dimensions.columns === null || !Number.isInteger(dimensions.rows) || dimensions.rows < 1 || dimensions.rows > 100 || !Number.isInteger(dimensions.columns) || dimensions.columns < 1 || dimensions.columns > 20} onClick={resize}>Aplicar</Button>
            </div>
            <div>
                <Button type="button" variant={value.showHeaders ? 'secondary' : 'outline'} size="sm" aria-pressed={value.showHeaders} onClick={() => onChange({...value, showHeaders: !value.showHeaders})}>{value.showHeaders ? <EyeIcon/> : <EyeSlashIcon/>}Encabezados</Button>
            </div>
        </>}
        <TableFrame contentSized headers={value.showHeaders ? value.headers : undefined} rows={value.rows} renderHeader={(cell, column) => render(String(cell), -1, column)} renderCell={(cell, row, column) => render(String(cell), row, column)}/>
        {!inline && <TopicFootnoteList footnotes={notes.footnotes}/>}
        <TableChangeConfirmation open={!!pending} onCancel={() => setPending(null)} onConfirm={() => {if (pending) onChange(pending); setActive(null); setPending(null);}}/>
    </div>;
}
