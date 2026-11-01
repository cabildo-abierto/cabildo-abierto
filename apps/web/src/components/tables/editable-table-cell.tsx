"use client";

import {memo} from 'react';
import {RichTextRenderer} from '@/components/rich-text/rich-text-renderer';
import {TableCellEditor} from './table-cell-editor';
import {cn} from '@/lib/utils';

export const EditableTableCell = memo(function EditableTableCell({content, row, column, active, disabled, topicId, footnoteNumbers, onActivate, onUpdate}: {
    content: string; row: number; column: number; active: boolean; disabled: boolean; topicId: string;
    footnoteNumbers: ReadonlyMap<string, number>;
    onActivate: (row: number, column: number) => void;
    onUpdate: (row: number, column: number, content: string) => void | boolean;
}) {
    if (active && !disabled) return <TableCellEditor topicId={topicId} content={content} footnoteNumbers={footnoteNumbers}
        onChange={next => onUpdate(row, column, next)}/>;
    return <div role={disabled ? undefined : 'button'} tabIndex={disabled ? undefined : 0} aria-disabled={disabled || undefined}
        aria-label={`Editar ${row < 0 ? 'encabezado' : `fila ${row + 1}`} columna ${column + 1}`}
        className={cn('rich-text-content block min-h-10 w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/30', !disabled && 'cursor-text')}
        onClick={event => {event.preventDefault(); if (!disabled) onActivate(row, column);}}
        onKeyDown={event => {if (event.key === 'Enter' || event.key === ' ') {event.preventDefault(); if (!disabled) onActivate(row, column);}}}>
        <RichTextRenderer content={content} linksEnabled={false} footnoteNumbers={footnoteNumbers}/>
    </div>;
});
