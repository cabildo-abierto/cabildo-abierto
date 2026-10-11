"use client";
import {useState} from 'react';
import {EyeIcon, EyeSlashIcon} from '@phosphor-icons/react';
import type {StaticTableContent} from '@cabildo-abierto/api';
import {isRichTextEmpty} from '@cabildo-abierto/utils';
import {Button} from '@/components/ui/button';
import {NumberInput} from '@/components/ui/number-input';
import {TableCellEditor} from './table-cell-editor';
import {RichTextRenderer} from '@/components/rich-text/rich-text-renderer';
import {topicFootnotes} from '@/components/rich-text/topic-footnotes';
import {TopicFootnoteList} from '@/components/rich-text/topic-footnote-list';
import {TableFrame} from './table-frame';
import {TableChangeConfirmation} from './table-change-confirmation';
import {cn} from '@/lib/utils';

export function StaticTableEditor({value, topicId, onChange}: {value: StaticTableContent; topicId: string; onChange: (value: StaticTableContent) => void}) {
    const [active, setActive] = useState<string | null>(null);
    const [pending, setPending] = useState<StaticTableContent | null>(null);
    const [dimensions, setDimensions] = useState<{rows: number | null; columns: number | null}>({rows: value.rows.length, columns: value.headers.length});
    const notes = topicFootnotes([{typeId: 'tabla', content: JSON.stringify(value)}]);
    const resize = () => {
        const {rows, columns} = dimensions;
        if (rows === null || columns === null || !Number.isInteger(rows) || rows < 1 || rows > 100 || !Number.isInteger(columns) || columns < 1 || columns > 20) return;
        const next: StaticTableContent = {...value, headers: Array.from({length: columns}, (_, c) => value.headers[c] ?? ''),
            rows: Array.from({length: rows}, (_, r) => Array.from({length: columns}, (_, c) => value.rows[r]?.[c] ?? ''))};
        const discarded = [...value.headers.slice(columns), ...value.rows.flatMap((row, r) => r >= rows ? row : row.slice(columns))];
        if (discarded.some(cell => !isRichTextEmpty(cell))) setPending(next);
        else {setActive(null); onChange(next);}
    };
    const render = (content: string, row: number, column: number) => {
        const key = `${row}:${column}`;
        const update = (content: string) => onChange(row < 0 ? {...value, headers: value.headers.map((cell, i) => i === column ? content : cell)}
            : {...value, rows: value.rows.map((cells, r) => r === row ? cells.map((cell, c) => c === column ? content : cell) : cells)});
        return active === key ? <TableCellEditor key={key} topicId={topicId} content={content} footnoteNumbers={notes.numberById} onChange={update}/>
            : <div role="button" tabIndex={0} aria-label={`Editar ${row < 0 ? 'encabezado' : `fila ${row + 1}`} columna ${column + 1}`} className={cn('rich-text-content block min-h-10 w-full cursor-text text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/30')} onClick={event => {event.preventDefault(); setActive(key);}} onKeyDown={event => {if (event.key === "Enter" || event.key === " ") {event.preventDefault(); setActive(key);}}}>
                <RichTextRenderer content={content} linksEnabled={false} footnoteNumbers={notes.numberById}/>
            </div>;
    };
    return <div className={cn('space-y-3')}>
        <div className={cn('flex flex-wrap items-end gap-2')}>
            <label className={cn('grid gap-1 text-xs')}>Filas<NumberInput min={1} max={100} value={dimensions.rows} onValueChange={rows => setDimensions({...dimensions, rows})}/></label>
            <label className={cn('grid gap-1 text-xs')}>Columnas<NumberInput min={1} max={20} value={dimensions.columns} onValueChange={columns => setDimensions({...dimensions, columns})}/></label>
            <Button type="button" variant="outline" size="sm" disabled={dimensions.rows === null || dimensions.columns === null || !Number.isInteger(dimensions.rows) || dimensions.rows < 1 || dimensions.rows > 100 || !Number.isInteger(dimensions.columns) || dimensions.columns < 1 || dimensions.columns > 20} onClick={resize}>Aplicar</Button>
        </div>
        <div>
            <Button type="button" variant={value.showHeaders ? 'secondary' : 'outline'} size="sm" aria-pressed={value.showHeaders} onClick={() => onChange({...value, showHeaders: !value.showHeaders})}>{value.showHeaders ? <EyeIcon/> : <EyeSlashIcon/>}Encabezados</Button>
        </div>
        <TableFrame equalColumns headers={value.showHeaders ? value.headers : undefined} rows={value.rows} renderHeader={(cell, column) => render(String(cell), -1, column)} renderCell={(cell, row, column) => render(String(cell), row, column)}/>
        <TopicFootnoteList footnotes={notes.footnotes}/>
        <TableChangeConfirmation open={!!pending} onCancel={() => setPending(null)} onConfirm={() => {if (pending) onChange(pending); setActive(null); setPending(null);}}/>
    </div>;
}
