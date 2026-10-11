import type {TopicBlock} from "@cabildo-abierto/api";
import {blockRichTextContents, parseFootnoteAttrs, type FootnoteAttrs, parseRichTextContent, richTextInlineNodes} from "@cabildo-abierto/utils";

export type TopicFootnote = FootnoteAttrs & {number: number};

export function topicFootnotes(blocks: Pick<TopicBlock, "typeId" | "content">[]): {
    footnotes: TopicFootnote[]
    numberById: ReadonlyMap<string, number>
} {
    const footnotes: TopicFootnote[] = [];
    const seen = new Set<string>();
    for (const block of blocks) {
        for (const content of blockRichTextContents(block)) {
            const richText = parseRichTextContent(content);
            for (const node of richText ? richTextInlineNodes(richText.doc) : []) {
                if (node.type !== "footnote" || seen.has(node.attrs.id)) continue;
                seen.add(node.attrs.id);
                const attrs = parseFootnoteAttrs(node.attrs);
                if (attrs) footnotes.push({...attrs, number: footnotes.length + 1});
            }
        }
    }
    return {footnotes, numberById: new Map(footnotes.map(note => [note.id, note.number]))};
}
