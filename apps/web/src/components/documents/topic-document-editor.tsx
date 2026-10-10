"use client";

import {useMemo, useState, type ReactNode} from "react";
import type {TopicBlock} from "@cabildo-abierto/api";
import {AttachmentSearch} from "@/components/attachments/attachment-search";
import {attachmentSearchMatcher} from "@/components/attachments/attachment-search-matches";
import {useDebouncedValue} from "@/hooks/use-debounced-value";
import {TopicDocumentEditorItem} from "./topic-document-editor-item";
import {DocumentSection} from "./document-section";
import {AttachmentSectionAddButton} from "@/components/attachments/attachment-section-add-button";
import type {AttachmentInsertionAction} from "@/components/attachments/attachment-insertion-picker";
import {TopicDeletedBlockItem} from "@/components/topic-deleted-blocks";
import {cn} from "@/lib/utils";

type EditableDocumentBlock = TopicBlock & {isNew: boolean; deleted: boolean};
export function TopicDocumentEditor({topicId, blocks, disabled, onChange, onRemove, onRestore, onBusyChange, renderActions, insertionAction, dataset = false}: {
    dataset?: boolean; topicId: string; blocks: EditableDocumentBlock[]; disabled: boolean;
    insertionAction: AttachmentInsertionAction;
    onChange: (block: TopicBlock) => void;
    renderActions: (blockNumber: string, onClose: () => void) => ReactNode;
    onRemove: (blockNumber: string) => void; onRestore: (blockNumber: string) => void;
    onBusyChange: (blockNumber: string, busy: boolean) => void;
}) {
    const [query, setQuery] = useState("");
    const [editingBlockNumber, setEditingBlockNumber] = useState<string | null>(null);
    const debouncedQuery = useDebouncedValue(query, 250);
    const matchesSearch = useMemo(() => attachmentSearchMatcher(debouncedQuery), [debouncedQuery]);
    const label = dataset ? "conjuntos de datos" : "documentos";
    if (blocks.length === 0) return null;
    return <DocumentSection dataset={dataset} actions={<AttachmentSectionAddButton type={dataset ? "dataset" : "documento"} action={insertionAction} disabled={disabled}/>}
        endActions={<AttachmentSearch dataset={dataset} value={query} onChange={setQuery}/>}>
        {() => {
            const matches = blocks.filter(block => block.blockNumber === editingBlockNumber || matchesSearch(block));
            return matches.length === 0 ? <p className={cn("col-span-full py-2 text-sm text-muted-foreground")}>No encontramos {label} para esa búsqueda.</p>
                : matches.map(block => <div key={block.blockNumber} className={cn("group/block relative")}>
                    {block.deleted ? <TopicDeletedBlockItem topicId={topicId} block={block} openInPage={false} onRestore={() => onRestore(block.blockNumber)}/>
                        : <TopicDocumentEditorItem key={block.id} onEditingChange={editing => setEditingBlockNumber(editing ? block.blockNumber : null)} topicId={topicId} block={block} isNew={block.isNew} disabled={disabled}
                            renderActions={onClose => renderActions(block.blockNumber, onClose)}
                            onChange={onChange} onRemove={() => onRemove(block.blockNumber)} onBusyChange={busy => onBusyChange(block.blockNumber, busy)}/>}
                </div>);
        }}
    </DocumentSection>;
}
