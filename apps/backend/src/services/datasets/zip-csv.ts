import {open as openFile, stat, rm} from 'node:fs/promises';
import {createWriteStream} from 'node:fs';
import {Transform} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {open as openZip, type Entry, type ZipFile} from 'yauzl';
import {datasetLimits} from './csv.js';

// Detect the contents rather than relying on a remote filename or MIME type.
export async function extractCSVIfZip(path: string, output: string): Promise<string> {
    const file = await openFile(path, 'r');
    const signature = Buffer.alloc(4);
    try { await file.read(signature, 0, 4, 0); }
    finally { await file.close(); }
    if (!['504b0304', '504b0506', '504b0708'].includes(signature.toString('hex'))) return path;
    const limit = datasetLimits().bytes;
    if ((await stat(path)).size > limit) throw new Error('El ZIP supera el tamaño permitido.');
    const zip = await new Promise<ZipFile>((resolve, reject) => {
        openZip(path, {lazyEntries: true, autoClose: false}, (error, archive) => {
            if (error) reject(error);
            else if (archive) resolve(archive);
            else reject(new Error('No pudimos abrir el ZIP.'));
        });
    });
    try {
        // Scan before extracting: a second CSV must never be silently ignored.
        const entry = await new Promise<Entry>((resolve, reject) => {
            let selected: Entry | undefined;
            let count = 0;
            zip.on('error', reject);
            zip.on('entry', (item: Entry) => {
                if (++count > 10000) { reject(new Error('El ZIP contiene demasiados archivos.')); return; }
                if (!item.fileName.endsWith('/') && /\.csv$/i.test(item.fileName)) {
                    if (selected) { reject(new Error('El ZIP debe contener un único CSV; contiene varios.')); return; }
                    if (item.isEncrypted()) { reject(new Error('El CSV del ZIP está cifrado.')); return; }
                    if (item.uncompressedSize > limit) { reject(new Error('El CSV descomprimido supera el tamaño permitido.')); return; }
                    selected = item;
                }
                zip.readEntry();
            });
            zip.once('end', () => selected ? resolve(selected) : reject(new Error('El ZIP no contiene ningún CSV.')));
            zip.readEntry();
        });
        const stream = await new Promise<import('node:stream').Readable>((resolve, reject) => {
            zip.openReadStream(entry, (error, source) => {
                if (error) reject(error);
                else if (source) resolve(source);
                else reject(new Error('No pudimos leer el CSV del ZIP.'));
            });
        });
        let bytes = 0;
        const bounded = new Transform({transform(chunk: Buffer, _encoding, callback) {
            bytes += chunk.length;
            callback(bytes > limit ? new Error('El CSV descomprimido supera el tamaño permitido.') : null, chunk);
        }});
        // A fixed filename avoids writing paths supplied by the archive.
        await pipeline(stream, bounded, createWriteStream(output, {flags: 'wx'}));
        return output;
    } catch (error) {
        await rm(output, {force: true});
        throw error;
    } finally { zip.close(); }
}
