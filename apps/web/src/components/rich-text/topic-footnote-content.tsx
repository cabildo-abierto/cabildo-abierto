"use client";

import {footnoteLabel, parseDocumentBlock, parseDatasetBlock, type FootnoteContent} from "@cabildo-abierto/utils";
import {DocumentLink} from "@/components/documents/document-link";
import {cn} from "@/lib/utils";
import {useFootnoteBlocks} from "./topic-footnote-context";

export function TopicFootnoteContent({note}: {note: FootnoteContent}) {
    const {topicId, blocks} = useFootnoteBlocks();
    if (note.kind === "text") return <span className={cn("whitespace-pre-wrap")}>{note.content}</span>;
    if (note.kind === "url") return <a href={note.url} target="_blank" rel="noopener noreferrer" className={cn("break-all underline underline-offset-2")}>{note.label || note.url}</a>;
    const block = blocks.find(block => block.blockNumber === note.blockNumber && block.typeId === (note.kind === "document" ? "documento" : "dataset"));
    const metadata = block ? (note.kind === "document" ? parseDocumentBlock(block.content) : parseDatasetBlock(block.content)) : null;
    if (!block || !metadata) return <span>{footnoteLabel(note)} no disponible</span>;
    const label = `${note.kind === "document" ? "Documento" : "Conjunto de datos"}: ${metadata.title}`;
    if (block.isNew) return <span title="Disponible al guardar">{label}</span>;
    return <DocumentLink block={block} title={metadata.title} topicId={topicId} className={cn("underline underline-offset-2")}>{label}</DocumentLink>;
}
