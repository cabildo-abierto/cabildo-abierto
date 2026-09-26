import {extname} from "node:path";
import {readFile} from "node:fs/promises";
import {parseCADocument} from "@cabildo-abierto/utils";
import type {DocumentFormat} from "@cabildo-abierto/api";
import {TopicActionError} from "#/services/topic-title-edits.js";
import {env} from "#/lib/env.js";

const formats: Record<string, {format: DocumentFormat; mime: string}> = {
    '.pdf': {format: 'pdf', mime: 'application/pdf'},
    '.doc': {format: 'office', mime: 'application/msword'},
    '.docx': {format: 'office', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'},
    '.odt': {format: 'office', mime: 'application/vnd.oasis.opendocument.text'},
    '.rtf': {format: 'office', mime: 'application/rtf'},
    '.txt': {format: 'text', mime: 'text/plain'},
    '.md': {format: 'markdown', mime: 'text/markdown'},
    '.markdown': {format: 'markdown', mime: 'text/markdown'},
    '.json': {format: 'ca', mime: 'application/json'},
};
export function documentFileType(name: string) {
    const extension = extname(name).toLowerCase();
    const type = formats[extension];
    if (!type) throw new TopicActionError(400, "El formato no está admitido. Podés subir PDF, DOC, DOCX, ODT, RTF, TXT, Markdown o CA.");
    return {...type, extension, maxBytes: (type.format === 'pdf' || type.format === 'office' ? env.DOCUMENT_MAX_MB : env.DOCUMENT_TEXT_MAX_MB) * 1024 * 1024};
}

export async function validateDocumentFile(path: string, name: string) {
    const type = documentFileType(name);
    const data = await readFile(path);
    if (!data.length || data.length > type.maxBytes) throw new TopicActionError(400, "El archivo está vacío o supera el tamaño permitido.");
    const invalid = () => { throw new TopicActionError(400, "El contenido no corresponde al formato del archivo."); };
    if (type.extension === '.pdf' && !data.subarray(0, 1024).includes(Buffer.from('%PDF-'))) invalid();
    if (type.extension === '.doc' && (data.subarray(0, 8).toString('hex') !== 'd0cf11e0a1b11ae1'
        || !data.includes(Buffer.from('WordDocument', 'utf16le')))) invalid();
    if (type.extension === '.rtf' && !data.subarray(0, 5).equals(Buffer.from('{\\rtf'))) invalid();
    if (type.extension === '.docx' || type.extension === '.odt') {
        // Check the ZIP directory markers without inflating untrusted archives.
        if (data.length < 4 || data.readUInt32LE(0) !== 0x04034b50 || !data.includes(Buffer.from(type.extension === '.docx' ? 'word/document.xml' : 'content.xml'))) invalid();
        if (type.extension === '.odt' && !data.includes(Buffer.from('application/vnd.oasis.opendocument.text'))) invalid();
    }
    let text: string | null = null;
    if (['text', 'markdown', 'ca'].includes(type.format)) {
        try { text = new TextDecoder('utf-8', {fatal: true}).decode(data); } catch { invalid(); }
        if (text!.includes('\0')) invalid();
    }
    let ca = null;
    if (type.format === 'ca') {
        try { ca = parseCADocument(JSON.parse(text!)); } catch { invalid(); }
        if (!ca) throw new TopicActionError(400, "El archivo no es un documento CA válido.");
    }
    return {...type, ca};
}
