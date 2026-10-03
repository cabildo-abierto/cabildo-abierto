import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {createReadStream} from 'node:fs';
import {parse} from 'csv-parse';
import {parse as parseSync} from 'csv-parse/sync';
import {datasetCell, DATASET_TYPES} from '@cabildo-abierto/utils';
import type {CSVOptions, DatasetColumn, DatasetColumnType} from '@cabildo-abierto/api';
import {datasetLimits} from './csv.js';
import {csvEncoding, type CSVEncoding} from './encoding.js';

// Match paired newlines first, including LFCR emitted by CIAM. csv-parse
// only treats these as record boundaries outside quoted fields.
const recordDelimiters = ['\r\n', '\n\r', '\n', '\r'];

export async function csvHeader(path: string, encoding: CSVEncoding = 'utf-8') {
    let text = ''; const decoder = new TextDecoder(encoding, {fatal: true});
    let quoted = false, end = -1;
    for await (const chunk of createReadStream(path, {highWaterMark:4096})) {
        const previous = text.length; text += decoder.decode(chunk,{stream:true});
        for(let i=previous;i<text.length;i++) {
            if(text[i] === '"') quoted = !quoted;
            if((text[i] === '\n' || text[i] === '\r') && !quoted && text.slice(0,i).trim()) {end=i+1;break;}
        }
        if(end>=0)break;
        if(Buffer.byteLength(text)>1024*1024)throw new Error('El encabezado del CSV es demasiado grande.');
    }
    if(end>=0)text=text.slice(0,end);
    const candidates = ([',',';'] as const).flatMap(delimiter=>{
        try { const rows=parseSync(text,{delimiter,record_delimiter:recordDelimiters,bom:true,skip_empty_lines:true}) as string[][];
            return rows.length ? [{delimiter,names:rows[0].map(s=>s.trim())}] : []; } catch {return [];}
    }).sort((a,b)=>b.names.length-a.names.length);
    const header=candidates[0];
    if(!header || !header.names.length || header.names.length>1000 || header.names.some(n=>!n || n.length>1000) || new Set(header.names).size!==header.names.length)throw new Error('Los encabezados deben ser únicos, no vacíos y tener hasta 1.000 columnas.');
    return header;
}
export async function* csvRows(path: string, delimiter: ',' | ';', encoding: CSVEncoding = 'utf-8') {
    const decoder = new TextDecoder(encoding, {fatal:true});
    async function* text() {
        let size = 0;
        for await (const chunk of createReadStream(path)) {
            size += chunk.length;
            if (size > datasetLimits().bytes) throw new Error('El CSV supera el tamaño permitido.');
            const value = decoder.decode(chunk, {stream:true});
            if (value.includes('\0')) throw new Error('El CSV contiene caracteres nulos.');
            yield value;
        }
        yield decoder.decode();
    }
    const parser = parse({delimiter, record_delimiter:recordDelimiters, bom:true, skip_empty_lines:true, max_record_size:datasetLimits().bytes});
    let failure: unknown;
    const feeding=pipeline(Readable.from(text()),parser).catch(error=>{failure=error;});
    try { let header = true; for await (const row of parser) { if (header) { header = false; continue; } yield row as string[]; } }
    finally { parser.destroy(); await feeding; }
    if(failure)throw failure;
}
export async function inspectCSV(path: string) {
    const encoding = await csvEncoding(path);
    const {names,delimiter} = await csvHeader(path, encoding);
    const candidates = names.map(() => ({'.':new Set(DATASET_TYPES.filter(t=>t!=='text')), ',':new Set(DATASET_TYPES.filter(t=>t!=='text')), nonempty:false, leading:false}));
    let commas = 0, dots = 0, rowCount = 0;
    for await (const row of csvRows(path,delimiter,encoding)) {
        rowCount++;
        row.forEach((raw,i) => {
            const value = raw.trim(), state = candidates[i];
            if (!value) return;
            state.nonempty = true; state.leading ||= /^[+-]?0\d/.test(value);
            if (/^[+-]?(?:\d*[.,]\d+)(?:[eE][+-]?\d+)?$/.test(value)) { if (value.includes(',')) commas++; else dots++; }
            for (const decimal of ['.',','] as const) for (const type of state[decimal]) if (datasetCell(raw,type,{delimiter,decimal}).error) state[decimal].delete(type);
        });
    }
    const csvOptions: CSVOptions = {delimiter,decimal:commas>dots ? ',' : '.'};
    const columns: DatasetColumn[] = names.map((name,i) => ({name,type: candidates[i].nonempty && !candidates[i].leading ? [...candidates[i][csvOptions.decimal]][0] as DatasetColumnType ?? 'text' : 'text'}));
    return {columns,csvOptions,rowCount,encoding};
}
