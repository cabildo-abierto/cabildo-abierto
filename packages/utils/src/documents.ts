import {claimsRichTextFormat, parseRichTextContent, isRichTextContent, isRichTextEmpty, richTextPlainText, type RichTextContent} from "./rich-text.js";

export type CADocument = {
    format: "cabildo-document";
    version: 1;
    blocks: Array<{typeId: "parrafo"; content: string | RichTextContent} | {typeId: "h1" | "h2"; content: string}>;
};
export type DocumentBlockContent = {fileId: string; title: string; description: string};
export const DOCUMENT_ACCEPT = ".pdf,.doc,.docx,.odt,.rtf,.txt,.md,.markdown,.json";

export function parseDocumentBlock(content: string): DocumentBlockContent | null {
    try {
        const value = JSON.parse(content);
        if (!value || typeof value !== "object" || Array.isArray(value)
            || typeof value.fileId !== "string" || !/^[0-9a-f-]{36}$/i.test(value.fileId)
            || typeof value.title !== "string" || !value.title.trim() || value.title.length > 200
            || typeof value.description !== "string" || value.description.length > 5_000) return null;
        return {fileId: value.fileId, title: value.title.trim(), description: value.description.trim()};
    } catch { return null; }
}

export function parseCADocument(value: unknown): CADocument | null {
    if (!value || typeof value !== "object") return null;
    const doc = value as CADocument;
    if (Object.keys(doc).some(key => !["format", "version", "blocks"].includes(key)) || doc.format !== "cabildo-document" || doc.version !== 1 || !Array.isArray(doc.blocks)
        || !doc.blocks.length || doc.blocks.length > 10_000) return null;
    for (const block of doc.blocks) {
        if (!block || typeof block !== "object" || Object.keys(block).some(key => !["typeId", "content"].includes(key))) return null;
        if (block.typeId === "h1" || block.typeId === "h2") {
            if (typeof block.content !== "string" || !block.content.trim() || block.content.length > 20_000 || /[\r\n]/.test(block.content)) return null;
        } else if (block.typeId === "parrafo") {
            if (typeof block.content !== "string" && !isRichTextContent(block.content)) return null;
            const content = typeof block.content === "string" ? block.content : JSON.stringify(block.content);
            if (claimsRichTextFormat(content) && !parseRichTextContent(content)) return null;
            if (isRichTextEmpty(content) || content.length > 100_000 || richTextPlainText(content).length > 20_000) return null;
        } else return null;
    }
    return doc;
}

export function compareContentBlocks(left: {typeId: string; order: string; blockNumber: string}, right: {typeId: string; order: string; blockNumber: string}): number {
    if (left.typeId === "documento" || right.typeId === "documento") {
        if (left.typeId !== right.typeId) return left.typeId === "documento" ? 1 : -1;
        return left.blockNumber.localeCompare(right.blockNumber, undefined, {numeric: true});
    }
    return left.order.localeCompare(right.order) || left.blockNumber.localeCompare(right.blockNumber);
}
