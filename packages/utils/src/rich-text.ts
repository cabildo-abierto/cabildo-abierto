export const RICH_TEXT_FORMAT = "cabildo-rich-text";
export const RICH_TEXT_VERSION = 1;

export type RichTextMark =
    | {type: "bold"}
    | {type: "italic"}
    | {type: "internal_link"; attrs: {topicId: string}}
    | {type: "external_link"; attrs: {href: string}};

export type RichTextInlineNode =
    | {type: "text"; text: string; marks?: RichTextMark[]}
    | {type: "hard_break"}
    | {type: "footnote"; attrs: {id: string; content: string}};

export type RichTextDocument = {
    type: "doc"
    content: [{type: "paragraph"; content?: RichTextInlineNode[]}]
};

export type RichTextContent = {
    format: typeof RICH_TEXT_FORMAT
    version: typeof RICH_TEXT_VERSION
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
    if (value.type === "hard_break") return exactKeys(value, ["type"]);
    if (value.type === "footnote") return exactKeys(value, ["type", "attrs"])
        && object(value.attrs)
        && exactKeys(value.attrs, ["id", "content"])
        && typeof value.attrs.id === "string"
        && /^[0-9a-f-]{36}$/i.test(value.attrs.id)
        && typeof value.attrs.content === "string"
        && value.attrs.content.trim().length > 0
        && value.attrs.content.length <= 5_000;
    if (value.type !== "text" || !exactKeys(value, ["type", "text", "marks"])
        || typeof value.text !== "string" || value.text.length === 0) return false;
    if (value.marks === undefined) return true;
    if (!Array.isArray(value.marks) || !value.marks.every(validMark)) return false;
    const types = value.marks.map(mark => mark.type);
    return new Set(types).size === types.length
        && !(types.includes("internal_link") && types.includes("external_link"));
}

export function isRichTextContent(value: unknown): value is RichTextContent {
    if (!object(value) || !exactKeys(value, ["format", "version", "doc"])
        || value.format !== RICH_TEXT_FORMAT || value.version !== RICH_TEXT_VERSION || !object(value.doc)
        || !exactKeys(value.doc, ["type", "content"]) || value.doc.type !== "doc"
        || !Array.isArray(value.doc.content) || value.doc.content.length !== 1) return false;
    const paragraph = value.doc.content[0];
    return object(paragraph) && exactKeys(paragraph, ["type", "content"])
        && paragraph.type === "paragraph"
        && (paragraph.content === undefined
            || (Array.isArray(paragraph.content) && paragraph.content.every(validInlineNode)));
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
    return (richText.doc.content[0].content ?? []).map(node => node.type === "text" ? node.text : node.type === "hard_break" ? "\n" : "").join("");
}

export function isRichTextEmpty(content: string): boolean {
    const richText = parseRichTextContent(content);
    if (!richText) return content.trim().length === 0;
    return !(richText.doc.content[0].content ?? []).some(node => node.type === "footnote"
        || (node.type === "text" && node.text.trim().length > 0));
}

export function richTextInternalTopicIds(content: string): string[] {
    const richText = parseRichTextContent(content);
    if (!richText) return [];
    const ids = (richText.doc.content[0].content ?? []).flatMap(node => node.type === "text"
        ? (node.marks ?? []).flatMap(mark => mark.type === "internal_link" ? [mark.attrs.topicId] : [])
        : []);
    return [...new Set(ids)];
}
