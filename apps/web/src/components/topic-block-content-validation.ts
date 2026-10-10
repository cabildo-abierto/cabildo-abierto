import type {TopicBlock} from "@cabildo-abierto/api";
import {isRichTextEmpty, parseDatasetBlock, parseDocumentBlock, parseImageBlock, parseVisualizationBlock, richTextPlainText} from "@cabildo-abierto/utils";

type BlockContent = Pick<TopicBlock, "typeId" | "content">;
type ContentValidation = {empty: boolean; invalid: boolean};

// Editor blocks are immutable snapshots. Keep expensive parsing tied to the changed block.
const validations = new WeakMap<BlockContent, ContentValidation>();

function contentValidation(block: BlockContent): ContentValidation {
    const cached = validations.get(block);
    if (cached) return cached;
    let empty: boolean;
    if (block.typeId === "imagen") empty = !parseImageBlock(block.content);
    else if (block.typeId === "visualizacion") empty = !parseVisualizationBlock(block.content);
    else if (block.typeId === "dataset") empty = !parseDatasetBlock(block.content);
    else if (block.typeId === "documento") empty = !parseDocumentBlock(block.content);
    else empty = block.typeId === "parrafo" ? isRichTextEmpty(block.content) : !block.content.trim();
    const invalid = empty
        || (block.typeId === "parrafo" && (block.content.length > 100_000 || richTextPlainText(block.content).length > 20_000))
        || ((block.typeId === "h1" || block.typeId === "h2") && /[\r\n]/.test(block.content));
    const result = {empty, invalid};
    validations.set(block, result);
    return result;
}

export function blockIsEmpty(block: BlockContent): boolean {
    return contentValidation(block).empty;
}

export function blockContentIsInvalid(block: BlockContent): boolean {
    return contentValidation(block).invalid;
}
