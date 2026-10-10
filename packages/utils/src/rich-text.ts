import type {LccaInput} from "@cabildo-abierto/api";
import {parseFootnoteAttrs, type FootnoteAttrs} from "./footnotes.js";
export const RICH_TEXT_FORMAT = "cabildo-rich-text";
export const RICH_TEXT_VERSION = 3;

export type RichTextMark =
    | {type: "bold"}
    | {type: "italic"}
    | {type: "internal_link"; attrs: {topicId: string}}
    | {type: "external_link"; attrs: {href: string}};

export type LccaValueAttrs = LccaInput;

export function parseLccaValueAttrs(value: unknown): LccaValueAttrs | null {
    return object(value) && exactKeys(value, ["query", "queryLanguageVersion"])
        && typeof value.query === "string" && !!value.query.trim() && value.query.length <= 20_000
        && value.queryLanguageVersion === 1 ? {query: value.query, queryLanguageVersion: 1} : null;
}

export type RichTextInlineNode =
    | {type: "text"; text: string; marks?: RichTextMark[]}
    | {type: "lcca_value"; attrs: LccaValueAttrs}
    | {type: "hard_break"}
    | {type: "footnote"; attrs: FootnoteAttrs | {id: string; content: string}};

export type RichTextParagraph = {type: "paragraph"; content?: RichTextInlineNode[]};
export type RichTextListItem = {type: "list_item"; content: [RichTextParagraph, ...RichTextBlockNode[]]};
export type RichTextList =
    | {type: "bullet_list"; content: RichTextListItem[]}
    | {type: "ordered_list"; attrs?: {order: number}; content: RichTextListItem[]};
export type RichTextBlockNode = RichTextParagraph | RichTextList;

export type RichTextDocument = {
    type: "doc"
    content: RichTextBlockNode[]
};

export type RichTextContent = {
    format: typeof RICH_TEXT_FORMAT
    version: 1 | 2 | typeof RICH_TEXT_VERSION
    doc: RichTextDocument
};

function object(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, allowed: string[]): boolean {
    return Object.keys(value).every(key => allowed.includes(key));
}

function validExternalUrl(value: string): boolean {
    try {
        const url = new URL(value);
        return (url.protocol === "http:" || url.protocol === "https:") && value.length <= 2_048;
    } catch {
        return false;
    }
}

function validMark(value: unknown): value is RichTextMark {
    if (!object(value) || typeof value.type !== "string") return false;
    if (value.type === "bold" || value.type === "italic") return exactKeys(value, ["type"]);
    if (!object(value.attrs) || !exactKeys(value, ["type", "attrs"])) return false;
    if (value.type === "internal_link") {
        return exactKeys(value.attrs, ["topicId"])
            && typeof value.attrs.topicId === "string"
            && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.attrs.topicId);
    }
    return value.type === "external_link"
        && exactKeys(value.attrs, ["href"])
        && typeof value.attrs.href === "string"
        && validExternalUrl(value.attrs.href);
}

function validInlineNode(value: unknown): value is RichTextInlineNode {
    if (!object(value) || typeof value.type !== "string") return false;
    if (value.type === "lcca_value") return exactKeys(value, ["type", "attrs"]) && !!parseLccaValueAttrs(value.attrs);
    if (value.type === "hard_break") return exactKeys(value, ["type"]);
    if (value.type === "footnote") return exactKeys(value, ["type", "attrs"]) && !!parseFootnoteAttrs(value.attrs);
    if (value.type !== "text" || !exactKeys(value, ["type", "text", "marks"])
        || typeof value.text !== "string" || value.text.length === 0) return false;
    if (value.marks === undefined) return true;
    if (!Array.isArray(value.marks) || !value.marks.every(validMark)) return false;
    const types = value.marks.map(mark => mark.type);
    return new Set(types).size === types.length
        && !(types.includes("internal_link") && types.includes("external_link"));
}

function validBlockNode(value: unknown, depth = 0): value is RichTextBlockNode {
    if (!object(value) || depth > 64) return false;
    if (value.type === "paragraph") return exactKeys(value, ["type", "content"])
        && (value.content === undefined || (Array.isArray(value.content) && value.content.every(validInlineNode)));
    if (value.type !== "bullet_list" && value.type !== "ordered_list") return false;
    if (!exactKeys(value, value.type === "ordered_list" ? ["type", "content", "attrs"] : ["type", "content"])) return false;
    if (value.type === "ordered_list" && value.attrs !== undefined
        && (!object(value.attrs) || !exactKeys(value.attrs, ["order"]) || !Number.isSafeInteger(value.attrs.order))) return false;
    return Array.isArray(value.content) && value.content.length > 0 && value.content.every(item =>
        object(item) && item.type === "list_item" && exactKeys(item, ["type", "content"])
        && Array.isArray(item.content) && item.content.length > 0 && object(item.content[0]) && item.content[0].type === "paragraph"
        && item.content.every(child => validBlockNode(child, depth + 1)));
}

export function isRichTextContent(value: unknown): value is RichTextContent {
    if (!object(value) || !exactKeys(value, ["format", "version", "doc"])
        || value.format !== RICH_TEXT_FORMAT || (value.version !== 1 && value.version !== 2 && value.version !== RICH_TEXT_VERSION) || !object(value.doc)
        || !exactKeys(value.doc, ["type", "content"]) || value.doc.type !== "doc"
        || !Array.isArray(value.doc.content) || !value.doc.content.length) return false;
    if (value.version === 1 && (value.doc.content.length !== 1 || !object(value.doc.content[0]) || value.doc.content[0].type !== "paragraph")) return false;
    return value.doc.content.every(node => validBlockNode(node))
        && (value.version === 3 || !richTextInlineNodes(value.doc as RichTextDocument).some(node => node.type === "lcca_value"));
}

export function richTextInlineNodes(doc: RichTextDocument): RichTextInlineNode[] {
    return richTextParagraphs(doc).flatMap(paragraph => paragraph.content ?? []);
}

export function richTextParagraphs(doc: RichTextDocument): RichTextParagraph[] {
    const result: RichTextParagraph[] = [];
    const visit = (node: RichTextBlockNode) => {
        if (node.type === "paragraph") result.push(node);
        else for (const item of node.content) for (const child of item.content) visit(child);
    };
    doc.content.forEach(visit);
    return result;
}

export function parseRichTextContent(content: string): RichTextContent | null {
    try {
        const value: unknown = JSON.parse(content);
        return isRichTextContent(value) ? value : null;
    } catch {
        return null;
    }
}

export function claimsRichTextFormat(content: string): boolean {
    try {
        const value: unknown = JSON.parse(content);
        return object(value) && value.format === RICH_TEXT_FORMAT;
    } catch {
        return false;
    }
}

export function richTextPlainText(content: string): string {
    const richText = parseRichTextContent(content);
    if (!richText) return content;
    return richTextParagraphs(richText.doc).map(paragraph => (paragraph.content ?? []).map(node => node.type === "text" ? node.text : node.type === "hard_break" ? "\n" : node.type === "lcca_value" ? "[Dato LCCA]" : "").join("")).join("\n");
}

export function isRichTextEmpty(content: string): boolean {
    const richText = parseRichTextContent(content);
    if (!richText) return content.trim().length === 0;
    return !richTextInlineNodes(richText.doc).some(node => node.type === "lcca_value" || node.type === "footnote"
        || (node.type === "text" && node.text.trim().length > 0));
}

export function richTextInternalTopicIds(content: string): string[] {
    const richText = parseRichTextContent(content);
    if (!richText) return [];
    const ids = richTextInlineNodes(richText.doc).flatMap(node => node.type === "text"
        ? (node.marks ?? []).flatMap(mark => mark.type === "internal_link" ? [mark.attrs.topicId] : [])
        : []);
    return [...new Set(ids)];
}
