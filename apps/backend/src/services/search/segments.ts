import type {SearchSegment} from './types.js';

const segmentBytes = 16 * 1024;

export function segmentSearchText(text: string, type: SearchSegment['type'], location: Record<string, number> = {}): SearchSegment[] {
    const segments: SearchSegment[] = [];
    let start = 0;
    while (start < text.length) {
        let bytes = 0, length = 0;
        for (const character of text.slice(start)) {
            const size = Buffer.byteLength(character);
            if (bytes + size > segmentBytes) break;
            bytes += size; length += character.length;
        }
        let end = start + length;
        if (end < text.length) {
            const candidate = text.slice(start, end);
            const newline = candidate.lastIndexOf('\n');
            if (newline >= 0) end = start + newline + 1;
            else {
                const spaces = [...candidate.matchAll(/\s+/g)];
                const last = spaces.at(-1);
                if (last) end = start + last.index + last[0].length;
            }
        }
        const body = text.slice(start, end);
        if (body.trim()) segments.push({title: '', text: body, type, location: {...location, start, end}});
        start = end;
    }
    return segments;
}

export function segmentSearchCSV(columns: string[], rows: string[][]): SearchSegment[] {
    const segments: SearchSegment[] = [];
    const header = columns.join(' | ');
    let group: string[] = [], start = 0, bytes = Buffer.byteLength(header) + 1;
    const flush = (end: number) => {
        const text = [header, ...group].join('\n');
        segments.push(...segmentSearchText(text, 'dataset', {rowStart: start + 1, rowEnd: end}).map(segment => ({...segment, config: 'search_simple' as const})));
        group = []; start = end; bytes = Buffer.byteLength(header) + 1;
    };
    for (let index = 0; index < rows.length; index++) {
        const line = rows[index].join(' | '), size = Buffer.byteLength(line) + 1;
        if (group.length && (group.length >= 100 || bytes + size > segmentBytes)) flush(index);
        group.push(line); bytes += size;
    }
    if (group.length || !rows.length) flush(rows.length);
    return segments;
}
