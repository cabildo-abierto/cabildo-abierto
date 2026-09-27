export type FootnoteContent =
    | {kind: "text"; content: string}
    | {kind: "url"; url: string; label?: string}
    | {kind: "document" | "dataset"; blockNumber: string};
export type FootnoteAttrs = {id: string} & FootnoteContent;

export function parseFootnoteAttrs(value: unknown): FootnoteAttrs | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const attrs = value as Record<string, unknown>;
    if (typeof attrs.id !== "string" || !/^[0-9a-f-]{36}$/i.test(attrs.id)) return null;
    const kind = attrs.kind ?? "text";
    const keys = kind === "text" ? ["id", "kind", "content"] : kind === "url" ? ["id", "kind", "url", "label"] : ["id", "kind", "blockNumber"];
    if (Object.keys(attrs).some(key => !keys.includes(key))) return null;
    if (kind === "text" && typeof attrs.content === "string" && attrs.content.trim() && attrs.content.length <= 5000)
        return {id: attrs.id, kind, content: attrs.content};
    if (kind === "url" && typeof attrs.url === "string" && attrs.url.length <= 2048
        && (attrs.label === undefined || typeof attrs.label === "string" && attrs.label.length <= 200)) {
        try {
            if (!["http:", "https:"].includes(new URL(attrs.url).protocol)) return null;
            return {id: attrs.id, kind, url: attrs.url, ...(attrs.label === undefined ? {} : {label: attrs.label as string})};
        } catch { return null; }
    }
    if ((kind === "document" || kind === "dataset") && typeof attrs.blockNumber === "string"
        && (new RegExp(`^${kind === "document" ? "d" : "ds"}-[1-9][0-9]*$`).test(attrs.blockNumber) || /^new-[0-9a-f-]{36}$/i.test(attrs.blockNumber)))
        return {id: attrs.id, kind, blockNumber: attrs.blockNumber};
    return null;
}

export function footnoteLabel(note: FootnoteContent): string {
    return note.kind === "text" ? note.content : note.kind === "url" ? note.label || note.url : note.kind === "document" ? "Documento" : "Conjunto de datos";
}
