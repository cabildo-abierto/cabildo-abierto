import {createReadStream} from 'node:fs';
import {datasetLimits} from './csv.js';

export type CSVEncoding = 'utf-8' | 'windows-1252';

// Validate the entire file: an ASCII header alone cannot identify its encoding.
// Without a declaration, Windows-1252 is a fallback convention, not a universal
// encoding detector. Never reinterpret an explicitly marked UTF-8 file.
export async function csvEncoding(path: string): Promise<CSVEncoding> {
    const decoder = new TextDecoder('utf-8', {fatal: true});
    let utf8 = true, markedUTF8 = false, invalidLegacy = false, size = 0;
    for await (const chunk of createReadStream(path)) {
        if (!size) markedUTF8 = chunk[0] === 0xef && chunk[1] === 0xbb && chunk[2] === 0xbf;
        size += chunk.length;
        if (size > datasetLimits().bytes) throw new Error('El CSV supera el tamaño permitido.');
        for (const byte of chunk) {
            if (byte === 0) throw new Error('El CSV contiene caracteres nulos o usa una codificación no admitida.');
            // Undefined Windows-1252 bytes and binary control characters.
            if ((byte < 32 && ![9, 10, 13].includes(byte)) || [0x7f, 0x81, 0x8d, 0x8f, 0x90, 0x9d].includes(byte)) invalidLegacy = true;
        }
        if (utf8) {
            try { decoder.decode(chunk, {stream: true}); }
            catch { utf8 = false; }
        }
    }
    if (utf8) {
        try { decoder.decode(); }
        catch { utf8 = false; }
    }
    if (utf8) return 'utf-8';
    if (markedUTF8 || invalidLegacy) throw new Error('No pudimos interpretar la codificación del CSV. Convertí el archivo a UTF-8.');
    return 'windows-1252';
}
