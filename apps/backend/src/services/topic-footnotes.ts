import type {SaveTopicEditBlockInput} from "@cabildo-abierto/api";
import {blockRichTextContents, mapBlockRichText, parseRichTextContent, parseFootnoteAttrs, richTextInlineNodes} from "@cabildo-abierto/utils";
import {TopicActionError} from "./topic-title-edits.js";

export function resolveTopicFootnotes(
    blocks: SaveTopicEditBlockInput[],
    localNumbers: ReadonlyMap<string, string>,
    previous: ReadonlyMap<string, {content: string}>,
): SaveTopicEditBlockInput[] {
    const targets = new Map(blocks.filter(block => !block.deleted).map(block => [block.blockNumber, block]));
    return blocks.map(block => {
        if (block.deleted || !blockRichTextContents(block).length) return block;
        const previousContent = block.blockNumber ? previous.get(block.blockNumber)?.content : undefined;
        const previousNodes = blockRichTextContents({typeId: block.typeId, content: previousContent ?? ""}).flatMap(content => {
            const document = parseRichTextContent(content);
            return document ? richTextInlineNodes(document.doc) : [];
        });
        const previousNotes = new Map(previousNodes
            .flatMap(node => node.type === "footnote" ? [[node.attrs.id, parseFootnoteAttrs(node.attrs)] as const] : []));
        const content = mapBlockRichText(block, content => {
            const richText = parseRichTextContent(content);
            if (!richText) return content;
            let rewritten = false;
            for (const node of richTextInlineNodes(richText.doc)) {
                if (node.type !== "footnote") continue;
                const note = parseFootnoteAttrs(node.attrs)!;
                if (note.kind !== "document" && note.kind !== "dataset") continue;
                const temporary = note.blockNumber.startsWith("new-");
                const targetNumber = temporary ? localNumbers.get(note.blockNumber) : note.blockNumber;
                if (!targetNumber) throw new TopicActionError(400, "Una nota al pie referencia un bloque nuevo que ya no está en la edición.");
                const target = targets.get(targetNumber);
                const old = previousNotes.get(note.id);
                const unchanged = old && old.kind === note.kind && "blockNumber" in old && old.blockNumber === note.blockNumber;
                if ((!target || target.typeId !== (note.kind === "document" ? "documento" : "dataset")) && (!unchanged || temporary))
                    throw new TopicActionError(400, "Elegí un documento o conjunto de datos disponible en este tema para la nota al pie.");
                if (temporary) {
                    node.attrs = {...note, blockNumber: targetNumber};
                    rewritten = true;
                }
            }
            return rewritten ? JSON.stringify(richText) : content;
        });
        return content === block.content ? block : {...block, content};
    });
}
