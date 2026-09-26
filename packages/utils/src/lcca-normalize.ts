import {nextLccaToken, tokenizeLcca} from './lcca-tokens.js';
import {lccaReservedWord} from './lcca-vocabulary.js';

export function lccaSourceLocation(query: string, offset: number): {line: number; column: number} {
    const lines = query.slice(0, offset).split('\n');
    return {line: lines.length, column: [...lines[lines.length - 1]].length + 1};
}

export function normalizeLcca(query: string) {
    const tokens = tokenizeLcca(query);
    const spans: {start: number; end: number; originalStart: number; originalEnd: number; sql: string}[] = [];
    const pieces: string[] = [];
    let offset = 0;
    for (const [index, token] of tokens.entries()) {
        const reserved = token.kind === 'word' ? lccaReservedWord(token.text) : undefined;
        if (reserved?.kind === 'function') {
            const next = nextLccaToken(tokens, index);
            if (next?.text !== '(') {
                const {line, column} = lccaSourceLocation(query, token.start);
                throw new Error(`«${token.text}» es una palabra reservada (línea ${line}, columna ${column}). Para usarla como columna o alias, escribila entre comillas dobles.`);
            }
        }
        const sql = reserved?.sql ?? token.text;
        pieces.push(sql);
        spans.push({start: offset, end: offset + sql.length, originalStart: token.start, originalEnd: token.end, sql});
        offset += sql.length;
    }
    const sql = pieces.join('');
    // DuckDB parser positions count Unicode code points, not UTF-16 units.
    const sourceAt = (position: number) => {
        let translatedOffset = 0, count = 0;
        for (const character of sql) {
            if (count++ >= position) break;
            translatedOffset += character.length;
        }
        const span = spans.find(span => translatedOffset >= span.start && translatedOffset < span.end);
        const originalOffset = span ? span.originalStart + (span.sql === query.slice(span.originalStart, span.originalEnd) ? translatedOffset - span.start : 0) : query.length;
        return {...lccaSourceLocation(query, originalOffset), token: span ? query.slice(span.originalStart, span.originalEnd) : '', translatedToken: span?.sql ?? ''};
    };
    return {sql, sourceAt};
}
