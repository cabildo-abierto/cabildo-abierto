import {open} from 'node:fs/promises';
import {inspectCSV} from './stream-csv.js';

// Preserve the existing parser and type inference while producing an unambiguous
// UTF-8 input for DuckDB, including empty strings and the original row ordinals.
export async function normalizeCSV(path: string, output: string) {
    const file = await open(output, 'wx');
    let buffer = '', maxLineBytes = 0;
    try {
        const metadata = await inspectCSV(path, async (row, ordinal) => {
            const line = `${ordinal},${row.map(value => `"${value.replaceAll('"', '""')}"`).join(',')}\n`;
            maxLineBytes = Math.max(maxLineBytes, Buffer.byteLength(line));
            buffer += line;
            if (buffer.length >= 256 * 1024) {
                await file.writeFile(buffer);
                buffer = '';
            }
        });
        if (buffer) await file.writeFile(buffer);
        return {metadata, maxLineBytes};
    } finally { await file.close(); }
}
