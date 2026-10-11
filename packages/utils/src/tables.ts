import type {TableContent, StaticTableContent, TopicBlock} from '@cabildo-abierto/api';
import {claimsRichTextFormat, parseRichTextContent, richTextPlainText} from './rich-text.js';

export function parseTableBlock(content: string): TableContent | null {
    try {
        if (content.length > 100_000) return null;
        const value = JSON.parse(content);
        if (!value || value.version !== 1) return null;
        if (value.mode === 'static') {
            const cell = (value: unknown) => typeof value === 'string' && value.length <= 100_000
                && richTextPlainText(value).length <= 20_000 && (!claimsRichTextFormat(value) || !!parseRichTextContent(value));
            if (!Array.isArray(value.headers) || value.headers.length < 1 || value.headers.length > 20 || !value.headers.every(cell)
                || typeof value.showHeaders !== 'boolean' || !Array.isArray(value.rows) || value.rows.length < 1 || value.rows.length > 100
                || !value.rows.every((row: unknown) => Array.isArray(row) && row.length === value.headers.length && row.every(cell))) return null;
            return {version: 1, mode: 'static', headers: value.headers, showHeaders: value.showHeaders, rows: value.rows};
        }
        if (value.mode !== 'dataset' || !value.source || typeof value.source.topicId !== 'string' || !value.source.topicId || value.source.topicId.length > 500
            || typeof value.source.blockNumber !== 'string' || !value.source.blockNumber || value.source.blockNumber.length > 500
            || !Array.isArray(value.columns) || !value.columns.length || value.columns.length > 200
            || !value.columns.every((column: {field?: unknown; label?: unknown}) => column && typeof column.field === 'string' && column.field.length > 0 && column.field.length <= 1000
                && (column.label === undefined || typeof column.label === 'string' && column.label.length <= 1000))
            || new Set(value.columns.map((column: {field: string}) => column.field)).size !== value.columns.length
            || !Number.isInteger(value.pageSize) || value.pageSize < 1 || value.pageSize > 100
            || (value.order !== null && (!value.order || !value.columns.some((column: {field: string}) => column.field === value.order.field) || !['asc', 'desc'].includes(value.order.direction)))) return null;
        return {version: 1, mode: 'dataset', source: {topicId: value.source.topicId, blockNumber: value.source.blockNumber},
            columns: value.columns.map((column: {field: string; label?: string}) => ({field: column.field, ...(column.label === undefined ? {} : {label: column.label})})),
            pageSize: value.pageSize, order: value.order ? {field: value.order.field, direction: value.order.direction} : null};
    } catch { return null; }
}

export function staticTableCells(table: StaticTableContent): string[] {
    return [...table.headers, ...table.rows.flat()];
}

/** All rich-text documents belonging to a block, in presentation order. */
export function blockRichTextContents(block: Pick<TopicBlock, 'typeId' | 'content'>): string[] {
    if (block.typeId === 'parrafo') return [block.content];
    const table = block.typeId === 'tabla' ? parseTableBlock(block.content) : null;
    return table?.mode === 'static' ? staticTableCells(table) : [];
}

export function mapBlockRichText(block: Pick<TopicBlock, 'typeId' | 'content'>, transform: (content: string) => string): string {
    if (block.typeId === 'parrafo') return transform(block.content);
    const table = block.typeId === 'tabla' ? parseTableBlock(block.content) : null;
    if (table?.mode !== 'static') return block.content;
    return JSON.stringify({...table, headers: table.headers.map(transform), rows: table.rows.map(row => row.map(transform))});
}
