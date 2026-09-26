"use client";

import {useState, type ReactNode} from "react";
import {FileTextIcon, PencilSimpleIcon, TrashIcon} from "@phosphor-icons/react";
import type {TopicBlock} from "@cabildo-abierto/api";
import {DocumentBlockForm} from "./document-block-form";
import {DocumentCard} from "./document-card";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

export function TopicDocumentEditorItem({topicId, block, disabled, onChange, onRemove, onBusyChange, renderActions}: {
    topicId: string;
    block: TopicBlock;
    disabled: boolean;
    onChange: (block: TopicBlock) => void;
    onRemove: () => void;
    onBusyChange: (busy: boolean) => void;
    renderActions: (onClose: () => void) => ReactNode;
}) {
    const [editing, setEditing] = useState(false);
    return <div className={cn("py-2")}>
        <div className={cn("flex items-start gap-2")}>
            {editing ? <>
                <FileTextIcon aria-hidden="true" className={cn("mt-1.5 size-4 shrink-0 text-muted-foreground")}/>
                <div className={cn("min-w-0 flex-1 space-y-2 py-1")}>
                    <DocumentBlockForm topicId={topicId} content={block.content} disabled={disabled} embedded
                        onChange={content => onChange({...block, content})} onBusyChange={onBusyChange}/>
                    {renderActions(() => setEditing(false))}
                </div>
            </> : <div className={cn("min-w-0 flex-1")}><DocumentCard block={block} linksEnabled={false}/></div>}
            {!editing && <Button type="button" variant="ghost" size="icon-sm" disabled={disabled} aria-expanded={false}
                aria-label="Editar documento" title="Editar documento" onClick={() => setEditing(true)}><PencilSimpleIcon/></Button>}
            <Button type="button" variant="ghost" size="icon-sm" disabled={disabled} aria-label="Quitar documento" title="Quitar documento" onClick={onRemove}><TrashIcon/></Button>
        </div>
    </div>;
}
