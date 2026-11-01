import type {TopicBlock} from "@cabildo-abierto/api";
import {blockRichTextContents, parseFootnoteAttrs, type FootnoteAttrs, parseRichTextContent, richTextInlineNodes} from "@cabildo-abierto/utils";

export type TopicFootnote = FootnoteAttrs & {number: number};
type FootnoteBlock = Pick<TopicBlock, 'typeId' | 'content'>;
export type TopicFootnoteCache = WeakMap<FootnoteBlock, FootnoteAttrs[]>;

export function topicFootnotes(blocks: FootnoteBlock[], cache?: TopicFootnoteCache): {
    footnotes: TopicFootnote[]
    numberById: ReadonlyMap<string, number>
} {
    const footnotes: TopicFootnote[] = [];
    const seen = new Set<string>();
    for (const block of blocks) {
        let notes = cache?.get(block);
        if (!notes) {
            notes = [];
            for (const content of blockRichTextContents(block)) {
                const richText = parseRichTextContent(content);
                for (const node of richText ? richTextInlineNodes(richText.doc) : []) {
                    if (node.type !== 'footnote') continue;
                    const attrs = parseFootnoteAttrs(node.attrs);
                    if (attrs) notes.push(attrs);
                }
            }
            cache?.set(block, notes);
        }
        for (const attrs of notes) {
            if (seen.has(attrs.id)) continue;
            seen.add(attrs.id);
            footnotes.push({...attrs, number: footnotes.length + 1});
        }
    }
    return {footnotes, numberById: new Map(footnotes.map(note => [note.id, note.number]))};
}
