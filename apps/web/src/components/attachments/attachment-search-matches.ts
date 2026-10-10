import type {TopicBlock} from "@cabildo-abierto/api";
import {parseDatasetBlock, parseDocumentBlock} from "@cabildo-abierto/utils";

type AttachmentBlock = Pick<TopicBlock, "typeId" | "content">;
const searchTexts = new WeakMap<AttachmentBlock, string>();

function normalized(value: string): string {
    return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("es-AR");
}

export function attachmentSearchMatcher(query: string): (block: AttachmentBlock) => boolean {
    const terms = normalized(query).trim().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return () => true;
    return block => {
        let text = searchTexts.get(block);
        if (text === undefined) {
            const metadata = block.typeId === "dataset" ? parseDatasetBlock(block.content) : parseDocumentBlock(block.content);
            text = metadata ? normalized(`${metadata.title} ${metadata.description}`) : "";
            searchTexts.set(block, text);
        }
        return terms.every(term => text.includes(term));
    };
}
