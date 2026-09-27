import {Schema, type Node as ProseMirrorNode} from "prosemirror-model";
import {footnoteLabel, parseFootnoteAttrs, RICH_TEXT_FORMAT, RICH_TEXT_VERSION, parseRichTextContent, type RichTextContent} from "@cabildo-abierto/utils";

export const richTextSchema = new Schema({
    nodes: {
        doc: {content: "paragraph"},
        paragraph: {content: "inline*", toDOM: () => ["p", {class: "m-0 p-0"}, 0], parseDOM: [{tag: "p"}]},
        text: {group: "inline"},
        hard_break: {inline: true, group: "inline", selectable: false, toDOM: () => ["br"], parseDOM: [{tag: "br"}]},
        footnote: {
            inline: true,
            group: "inline",
            atom: true,
            attrs: {id: {}, kind: {default: "text"}, content: {default: null}, url: {default: null}, label: {default: null}, blockNumber: {default: null}},
            toDOM: node => ["sup", {
                id: `footnote-ref-${node.attrs.id}`,
                "data-footnote-id": node.attrs.id,
                "data-footnote-content": node.attrs.content ?? "",
                "data-footnote": JSON.stringify(footnoteNodeAttrs(node.attrs)),
                class: "cursor-pointer font-medium text-primary underline underline-offset-2",
                title: footnoteLabel(footnoteNodeAttrs(node.attrs)),
            }, "*"],
            parseDOM: [{tag: "[data-footnote-id]", getAttrs: element => {
                const dom = element as HTMLElement;
                try {
                    const attrs = dom.dataset.footnote ? JSON.parse(dom.dataset.footnote) : {id: dom.dataset.footnoteId, content: dom.dataset.footnoteContent};
                    return parseFootnoteAttrs(attrs) ?? false;
                } catch { return false; }
            }}],
        },
    },
    marks: {
        bold: {
            toDOM: () => ["strong", 0],
            parseDOM: [{tag: "strong"}, {tag: "b"}, {style: "font-weight=bold"}],
        },
        italic: {
            toDOM: () => ["em", 0],
            parseDOM: [{tag: "em"}, {tag: "i"}, {style: "font-style=italic"}],
        },
        internal_link: {
            attrs: {topicId: {}},
            inclusive: false,
            excludes: "internal_link external_link",
            toDOM: mark => ["a", {
                href: `/tema/${encodeURIComponent(mark.attrs.topicId)}`,
                "data-topic-id": mark.attrs.topicId,
                class: "underline underline-offset-2",
            }, 0],
            parseDOM: [{tag: "a[data-topic-id]", getAttrs: element => ({topicId: (element as HTMLElement).dataset.topicId})}],
        },
        external_link: {
            attrs: {href: {}},
            inclusive: false,
            excludes: "internal_link external_link",
            toDOM: mark => ["a", {
                href: mark.attrs.href,
                target: "_blank",
                rel: "noopener noreferrer",
                class: "underline underline-offset-2",
            }, 0],
            parseDOM: [{tag: "a[href]:not([data-topic-id])", getAttrs: element => {
                const href = (element as HTMLAnchorElement).href;
                return href.startsWith("http://") || href.startsWith("https://") ? {href} : false;
            }}],
        },
    },
});

export function footnoteNodeAttrs(attrs: Record<string, unknown>) {
    const kind = attrs.kind ?? "text";
    const value = kind === "text" ? {id: attrs.id, kind, content: attrs.content}
        : kind === "url" ? {id: attrs.id, kind, url: attrs.url, ...(attrs.label == null ? {} : {label: attrs.label})}
        : {id: attrs.id, kind, blockNumber: attrs.blockNumber};
    const note = parseFootnoteAttrs(value);
    if (!note) throw new Error("Nota al pie inválida.");
    return note;
}

function plainTextDocument(content: string): ProseMirrorNode {
    const inline: ProseMirrorNode[] = [];
    content.split("\n").forEach((line, index) => {
        if (index > 0) inline.push(richTextSchema.nodes.hard_break.create());
        if (line) inline.push(richTextSchema.text(line));
    });
    return richTextSchema.node("doc", null, [richTextSchema.node("paragraph", null, inline)]);
}

export function richTextDocumentFromString(content: string): ProseMirrorNode {
    const parsed = parseRichTextContent(content);
    if (!parsed) return plainTextDocument(content);
    try {
        return richTextSchema.nodeFromJSON(parsed.doc);
    } catch {
        return plainTextDocument(content);
    }
}

export function serializeRichTextDocument(doc: ProseMirrorNode): string {
    const plainText = doc.textBetween(0, doc.content.size, "\n", "\n");
    if (!plainText.trim() && !doc.toJSON().content[0].content?.some((node: {type: string}) => node.type === "footnote")) return "";
    const content: RichTextContent = {
        format: RICH_TEXT_FORMAT,
        version: RICH_TEXT_VERSION,
        doc: doc.toJSON() as RichTextContent["doc"],
    };
    for (const node of content.doc.content[0].content ?? []) {
        if (node.type === "footnote") node.attrs = footnoteNodeAttrs(node.attrs);
    }
    return JSON.stringify(content);
}
