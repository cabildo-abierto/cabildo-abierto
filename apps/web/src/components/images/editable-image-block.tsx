"use client";

import type {ComponentProps, ReactNode} from "react";
import type {TopicBlock} from "@cabildo-abierto/api";
import {parseImageBlock} from "@cabildo-abierto/utils";
import {TopicBlockTools} from "@/components/topic-block-tools";
import {useImageSelection} from "@/hooks/use-image-selection";
import {cn} from "@/lib/utils";
import {ImageCanvas} from "./image-canvas";
import {ImageEditActions} from "./image-edit-actions";
import {ImagePositionActions} from "./image-position-actions";

export function EditableImageBlock({block, onChange, onEdit, onRemove, disabled, toolsProps, changeIndicator}: {
    block: TopicBlock;
    changeIndicator?: ReactNode;
    onChange: (block: TopicBlock) => void;
    onEdit: () => void;
    onRemove: () => void;
    disabled: boolean;
    toolsProps: Omit<ComponentProps<typeof TopicBlockTools>, "block" | "actions">;
}) {
    const selection = useImageSelection();
    const value = parseImageBlock(block.content);
    if (!value) return <p role="alert" className={cn("text-xs text-destructive")}>La configuración de la imagen no es válida.</p>;
    const update = (next: typeof value) => onChange({...block, content: JSON.stringify(next)});

    return <div ref={selection.ref} className={cn("py-2")}>
        <ImageCanvas changeIndicator={changeIndicator} key={value.fileId} value={value} selected={selection.selected} onSelect={selection.select}
            onWidthChange={widthPercent => update({...value, widthPercent})} disabled={disabled}/>
        <TopicBlockTools {...toolsProps} block={block} actions={<>
            {selection.selected && <ImagePositionActions value={value} onChange={update} disabled={disabled}/>}
            <ImageEditActions disabled={disabled} onEdit={onEdit} onRemove={onRemove}/>
        </>}/>
    </div>;
}
