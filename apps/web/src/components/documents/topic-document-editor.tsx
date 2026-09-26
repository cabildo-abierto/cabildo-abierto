"use client";

import type {ReactNode} from "react";
import type {TopicBlock} from "@cabildo-abierto/api";
import {TopicDocumentEditorItem} from "./topic-document-editor-item";
import {DocumentSection} from "./document-section";
import {TopicBlockTools} from "@/components/topic-block-tools";
import {TopicDeletedBlockItem} from "@/components/topic-deleted-blocks";
import {cn} from "@/lib/utils";

type EditableDocumentBlock = TopicBlock & {isNew: boolean; deleted: boolean};
export function TopicDocumentEditor({topicId, blocks, disabled, onChange, onRemove, onRestore, onBusyChange, renderActions}: {
    topicId: string; blocks: EditableDocumentBlock[]; disabled: boolean;
    onChange: (block: TopicBlock) => void;
    renderActions: (blockNumber: string, onClose: () => void) => ReactNode;
    onRemove: (blockNumber: string) => void; onRestore: (blockNumber: string) => void;
    onBusyChange: (blockNumber: string, busy: boolean) => void;
}) {
    if (blocks.length === 0) return null;
    return <DocumentSection>
        {blocks.map(block => <div key={block.blockNumber} className={cn("group/block relative")}>
            {block.deleted ? <TopicDeletedBlockItem topicId={topicId} block={block} openInPage={false} onRestore={() => onRestore(block.blockNumber)}/>
                : <><TopicDocumentEditorItem key={block.id} topicId={topicId} block={block} disabled={disabled}
                    renderActions={onClose => renderActions(block.blockNumber, onClose)}
                    onChange={onChange} onRemove={() => onRemove(block.blockNumber)} onBusyChange={busy => onBusyChange(block.blockNumber, busy)}/>
                {!block.isNew && <TopicBlockTools topicId={topicId} block={block}/>}</>}
        </div>)}
    </DocumentSection>;
}
