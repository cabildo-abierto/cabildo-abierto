import {Schema, type Node as ProseMirrorNode} from "prosemirror-model";
import {RICH_TEXT_FORMAT, RICH_TEXT_VERSION, parseRichTextContent, type RichTextContent} from "@cabildo-abierto/utils";

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
            attrs: {id: {}, content: {}},
            toDOM: node => ["sup", {
                "data-footnote-id": node.attrs.id,
                "data-footnote-content": node.attrs.content,
                class: "cursor-pointer font-medium text-primary underline underline-offset-2",
                title: node.attrs.content,
            }, "*"],
            parseDOM: [{tag: "sup[data-footnote-id]", getAttrs: element => ({
                id: (element as HTMLElement).dataset.footnoteId,
                content: (element as HTMLElement).dataset.footnoteContent,
            })}],
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
    if (!plainText.trim()) return "";
    const content: RichTextContent = {
        format: RICH_TEXT_FORMAT,
        version: RICH_TEXT_VERSION,
        doc: doc.toJSON() as RichTextContent["doc"],
    };
    return JSON.stringify(content);
}
