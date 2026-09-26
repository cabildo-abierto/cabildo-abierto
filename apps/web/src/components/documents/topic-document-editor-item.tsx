"use client";

import {DatasetEditorPopup} from '@/components/datasets/dataset-editor-popup';
import {parseDatasetBlock} from '@cabildo-abierto/utils';

import {useState, type ReactNode} from "react";
import {PencilSimpleIcon, TrashIcon} from "@phosphor-icons/react";
import type {TopicBlock} from "@cabildo-abierto/api";
import {DocumentBlockForm} from "./document-block-form";
import {DocumentCard} from "./document-card";
import {Button} from "@/components/ui/button";
import {TopicBlockTools} from "@/components/topic-block-tools";
import {cn} from "@/lib/utils";

export function TopicDocumentEditorItem({topicId, block, isNew, disabled, onChange, onRemove, onBusyChange, renderActions}: {
    topicId: string;
    block: TopicBlock;
    isNew: boolean;
    disabled: boolean;
    onChange: (block: TopicBlock) => void;
    onRemove: () => void;
    onBusyChange: (busy: boolean) => void;
    renderActions: (onClose: () => void) => ReactNode;
}) {
    const dataset = block.typeId === "dataset";
    const [editing, setEditing] = useState(dataset && !parseDatasetBlock(block.content));
    const actions = <>
        {!editing && <Button type="button" variant="ghost" size="sm" className={cn("text-muted-foreground")} disabled={disabled} aria-expanded={editing}
            aria-label={dataset ? "Editar conjunto de datos" : "Editar documento"} title="Editar" onClick={() => setEditing(true)}><PencilSimpleIcon className={cn("size-4")}/></Button>}
        <Button type="button" variant="ghost" size="sm" className={cn("text-muted-foreground")} disabled={disabled} aria-label={dataset ? "Quitar conjunto de datos" : "Quitar documento"} title="Quitar" onClick={onRemove}><TrashIcon className={cn("size-4")}/></Button>
    </>;
    return <div className={cn("py-2")}>
        <div className={cn("flex items-start gap-2")}>
            {editing && !dataset ? <>
                <div className={cn("min-w-0 flex-1 space-y-2 py-1")}>
                    <DocumentBlockForm topicId={topicId} content={block.content} disabled={disabled} embedded
                        onChange={content => onChange({...block, content})} onBusyChange={onBusyChange}/>
                    {renderActions(() => setEditing(false))}
                </div>
            </> : <div className={cn("min-w-0 flex-1")}><DocumentCard block={block} linksEnabled={false}/></div>}

        </div>
        {isNew ? <div className={cn("flex items-center justify-end gap-1")}>{actions}</div>
            : <TopicBlockTools topicId={topicId} block={block} actions={actions}/>}
        {dataset && editing && <DatasetEditorPopup topicId={topicId} content={block.content} disabled={disabled}
            onChange={content => onChange({...block, content})} onBusyChange={onBusyChange} onClose={() => setEditing(false)}>
            {renderActions(() => setEditing(false))}
        </DatasetEditorPopup>}
    </div>;
}
