"use client"

import {forwardRef, useImperativeHandle, useState} from "react";
import type {BlockType, SaveBlockInput, SaveBlockOutput, SaveBlockReorderInput, SaveBlockReorderOutput, TopicBlock} from "@cabildo-abierto/api";
import {DotsSixVerticalIcon, PencilSimpleIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {TopicBlockContent} from "@/components/topic-block-content";
import {TopicBlockTools} from "@/components/topic-block-tools";
import {TopicBlockInsertButton} from "@/components/topic-block-insert-button";
import {patch, post} from "@/utils/react/fetch";

type Draft = {typeId: BlockType["id"]; content: string};

function BlockTypeIcon({typeId}: {typeId: BlockType["id"]}) {
    if (typeId === "h1") return <span className="inline-flex h-4 min-w-4 items-center justify-center text-sm font-semibold leading-none" aria-hidden="true">T1</span>;
    if (typeId === "h2") return <span className="inline-flex h-4 min-w-4 items-center justify-center text-sm font-semibold leading-none" aria-hidden="true">T2</span>;
    return <span className="inline-flex size-4 items-center justify-center text-sm font-semibold leading-none" aria-hidden="true">P</span>;
}

function BlockForm({topicId, blockId, commentCount, draft, blockNumber, order, types, canChangeType, saving, error, onChange, onSave, onCancel, shaking, onShakeEnd}: {
    topicId: string
    blockId?: string
    commentCount?: number
    draft: Draft
    blockNumber?: string
    order?: string
    types: BlockType[]
    canChangeType: boolean
    saving: boolean
    error: string | null
    onChange: (draft: Draft) => void
    onSave: () => void
    onCancel: () => void
    shaking?: boolean
    onShakeEnd?: () => void
}) {
    const changeType = (typeId: BlockType["id"] | null) => {
        if (!typeId) return;
        const content = typeId === "parrafo" ? draft.content : draft.content.replace(/[\r\n]+/g, " ");
        onChange({typeId, content});
    };

    return <div
        className={`group/block relative -mx-3 space-y-3 px-3 py-2 ${shaking ? "animate-[block-shake_180ms_ease-in-out]" : ""}`}
        onAnimationEnd={onShakeEnd}
    >
        {draft.typeId === "parrafo" ? <Textarea
            value={draft.content}
            onChange={event => onChange({...draft, content: event.target.value})}
            placeholder="Escribí un párrafo..."
            className="min-h-[1lh] resize-none rounded-none border-0 bg-transparent p-0 text-sm leading-relaxed shadow-none focus-visible:border-transparent focus-visible:ring-0 md:text-sm dark:bg-transparent"
            maxLength={20_000}
            autoFocus
        /> : <Input
            value={draft.content}
            onChange={event => onChange({...draft, content: event.target.value})}
            placeholder={draft.typeId === "h1" ? "Título de sección" : "Título de subsección"}
            className={`h-auto rounded-none border-0 bg-transparent px-0 py-0 font-semibold shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent ${draft.typeId === "h1" ? "text-xl md:text-xl" : "text-base md:text-base"}`}
            maxLength={20_000}
            autoFocus
        />}
        {blockNumber && <span className="absolute top-3 right-full mr-2 text-[10px] whitespace-nowrap text-muted-foreground">{blockNumber}</span>}
        {blockNumber && blockId && <TopicBlockTools
            topicId={topicId}
            block={{id: blockId, blockNumber, typeId: draft.typeId, content: draft.content, order: order ?? "n", commentCount: commentCount ?? 0}}
            buttonClassName="-translate-x-3"
        />}
        {error && <p className="text-xs text-destructive">{error}</p>}
        <div className="flex flex-wrap items-center justify-between gap-3">
            {canChangeType ? <Select value={draft.typeId} onValueChange={changeType}>
                    <SelectTrigger className="w-16 cursor-pointer" aria-label={`Tipo de bloque: ${types.find(type => type.id === draft.typeId)?.name ?? draft.typeId}`}>
                        <SelectValue><BlockTypeIcon typeId={draft.typeId}/></SelectValue>
                    </SelectTrigger>
                    <SelectContent className="w-max min-w-48">
                        {types.map(type => <SelectItem key={type.id} value={type.id} className="cursor-pointer" aria-label={type.name} title={type.name}>
                            <BlockTypeIcon typeId={type.id}/>
                            <span>{type.name}</span>
                        </SelectItem>)}
                    </SelectContent>
                </Select>
                : <span className="inline-flex h-6 items-center gap-1.5 text-xs text-muted-foreground" aria-label={`Tipo de bloque: ${types.find(type => type.id === draft.typeId)?.name ?? draft.typeId}`}>
                    <BlockTypeIcon typeId={draft.typeId}/>
                    <span>{types.find(type => type.id === draft.typeId)?.name ?? draft.typeId}</span>
                </span>}
            <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>Cancelar</Button>
                <Button type="button" onClick={onSave} disabled={saving || !draft.content.trim()}>{saving ? "Guardando…" : "Guardar"}</Button>
            </div>
        </div>
    </div>;
}

export type TopicBlockEditorHandle = {
    canFinishEditing: () => boolean
};

export const TopicBlockEditor = forwardRef<TopicBlockEditorHandle, {topicId: string; initialBlocks: TopicBlock[]; blockTypes: BlockType[]}>(function TopicBlockEditor({topicId, initialBlocks, blockTypes}, ref) {
    const [blocks, setBlocks] = useState(initialBlocks);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newDraft, setNewDraft] = useState(false);
    const [insertAfter, setInsertAfter] = useState<string | null>(null);
    const [savedOrder, setSavedOrder] = useState(() => initialBlocks.map(block => block.blockNumber));
    const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
    const [savingReorder, setSavingReorder] = useState(false);
    const [reorderError, setReorderError] = useState<string | null>(null);
    const [draft, setDraft] = useState<Draft>({typeId: "parrafo", content: ""});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [shaking, setShaking] = useState(false);

    const hasUnsavedChanges = () => {
        if (newDraft) return draft.typeId !== "parrafo" || draft.content !== "";
        const original = blocks.find(block => block.id === editingId);
        return original ? original.typeId !== draft.typeId || original.content !== draft.content : false;
    };
    const reordered = blocks.some((block, index) => block.blockNumber !== savedOrder[index]);
    const shakeActiveBlock = () => {
        setShaking(false);
        requestAnimationFrame(() => setShaking(true));
    };

    useImperativeHandle(ref, () => ({
        canFinishEditing: () => {
            if (!hasUnsavedChanges() && !reordered) return true;
            shakeActiveBlock();
            return false;
        },
    }));

    const edit = (block: TopicBlock) => {
        setEditingId(block.id);
        setNewDraft(false);
        setInsertAfter(null);
        setDraft({typeId: block.typeId, content: block.content});
        setError(null);
    };
    const cancel = () => {
        setEditingId(null);
        setNewDraft(false);
        setError(null);
        setShaking(false);
    };
    const requestEdit = (block: TopicBlock) => {
        if (editingId === null && !newDraft) {
            edit(block);
            return;
        }
        if (hasUnsavedChanges()) {
            shakeActiveBlock();
            return;
        }
        edit(block);
    };
    const save = async () => {
        setSaving(true);
        setError(null);
        const input: SaveBlockInput = editingId ? draft : {...draft, insertAfterBlockNumber: insertAfter};
        const result = editingId
            ? await patch<SaveBlockInput, SaveBlockOutput>(`/topics/${encodeURIComponent(topicId)}/blocks/${encodeURIComponent(editingId)}`, input)
            : await post<SaveBlockInput, SaveBlockOutput>(`/topics/${encodeURIComponent(topicId)}/blocks`, input);
        setSaving(false);
        if ("error" in result) {
            setError(result.error);
            return;
        }
        setBlocks(current => {
            if (editingId) return current.map(block => block.id === editingId ? result.value.block : block);
            const anchorIndex = insertAfter === null ? -1 : current.findIndex(block => block.blockNumber === insertAfter);
            const next = [...current];
            next.splice(anchorIndex + 1, 0, result.value.block);
            setSavedOrder(next.map(block => block.blockNumber));
            return next;
        });
        cancel();
    };

    const startNewBlock = (after: string | null) => {
        setDraft({typeId: "parrafo", content: ""});
        setInsertAfter(after);
        setNewDraft(true);
        setError(null);
    };

    const moveDraggedBlock = (target: string) => {
        if (!draggedBlock || draggedBlock === target) return;
        setBlocks(current => {
            const from = current.findIndex(block => block.blockNumber === draggedBlock);
            const to = current.findIndex(block => block.blockNumber === target);
            if (from === -1 || to === -1) return current;
            const next = [...current];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            return next;
        });
    };

    const saveReorder = async () => {
        setSavingReorder(true);
        setReorderError(null);
        const input: SaveBlockReorderInput = {blockNumbers: blocks.map(block => block.blockNumber)};
        const result = await post<SaveBlockReorderInput, SaveBlockReorderOutput>(`/topics/${encodeURIComponent(topicId)}/reorders`, input);
        setSavingReorder(false);
        if ("error" in result) {
            setReorderError(result.error);
            return;
        }
        setBlocks(result.value.blocks);
        setSavedOrder(result.value.blocks.map(block => block.blockNumber));
    };

    return <div className="relative flex flex-1 flex-col gap-2">
        {editingId === null && !newDraft && !reordered
            ? <div className="absolute inset-x-0 top-0 z-10 -translate-y-1/2"><TopicBlockInsertButton onClick={() => startNewBlock(null)}/></div>
            : null}
        {newDraft && insertAfter === null && <BlockForm topicId={topicId} draft={draft} types={blockTypes} canChangeType saving={saving} error={error} onChange={setDraft} onSave={() => void save()} onCancel={cancel} shaking={shaking} onShakeEnd={() => setShaking(false)}/>}
        {blocks.map((block, index) => <div
            key={block.blockNumber}
            draggable={editingId === null && !newDraft}
            onDragStart={event => {
                setDraggedBlock(block.blockNumber);
                event.dataTransfer.effectAllowed = "move";
            }}
            onDragEnter={() => moveDraggedBlock(block.blockNumber)}
            onDragOver={event => event.preventDefault()}
            onDragEnd={() => setDraggedBlock(null)}
            className={draggedBlock === block.blockNumber ? "opacity-50" : ""}
        >{editingId === block.id ? <BlockForm
            key={block.id} topicId={topicId} blockId={block.id} commentCount={block.commentCount} draft={draft} types={blockTypes} saving={saving} error={error}
            canChangeType={false}
            blockNumber={block.blockNumber}
            order={block.order}
            onChange={setDraft} onSave={() => void save()} onCancel={cancel}
            shaking={shaking} onShakeEnd={() => setShaking(false)}
        /> : <div className="group/block relative">
            <article
                className="group/edit relative -mx-3 cursor-text rounded-lg px-3 py-2 outline-none hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/30"
                role="button"
                tabIndex={0}
                aria-label={`Editar bloque ${block.blockNumber}`}
                onClick={() => { if (!reordered) requestEdit(block); }}
                onKeyDown={event => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        if (!reordered) requestEdit(block);
                    }
                }}
            >
                <TopicBlockContent block={block}/>
                <span className="pointer-events-none absolute top-3 right-full mr-2 inline-flex items-center gap-1 text-[10px] whitespace-nowrap text-muted-foreground opacity-0 transition-opacity group-hover/edit:opacity-100 group-focus-visible/edit:opacity-100">
                    <DotsSixVerticalIcon className="size-4" aria-hidden="true"/>
                    {block.blockNumber}
                </span>
                <PencilSimpleIcon className="pointer-events-none absolute top-3 right-3 size-4 text-muted-foreground opacity-0 group-hover/edit:opacity-100 group-focus-visible/edit:opacity-100"/>
            </article>
            <TopicBlockTools topicId={topicId} block={block}/>
        </div>}
        {newDraft && insertAfter === block.blockNumber && <BlockForm topicId={topicId} draft={draft} types={blockTypes} canChangeType saving={saving} error={error} onChange={setDraft} onSave={() => void save()} onCancel={cancel} shaking={shaking} onShakeEnd={() => setShaking(false)}/>}
        {index < blocks.length - 1 && (editingId === null && !newDraft && !reordered
            ? <TopicBlockInsertButton onClick={() => startNewBlock(block.blockNumber)}/>
            : !newDraft || insertAfter !== block.blockNumber ? <div className="h-0" aria-hidden="true"/> : null)}</div>)}
        {editingId === null && !newDraft && !reordered && <TopicBlockInsertButton
            fillRemainingSpace
            onClick={() => startNewBlock(blocks.at(-1)?.blockNumber ?? null)}
        />}
        {reorderError && <p className="text-xs text-destructive">{reorderError}</p>}
        {reordered && <div className="sticky bottom-4 flex justify-end"><Button type="button" onClick={() => void saveReorder()} disabled={savingReorder}>
            {savingReorder ? "Guardando…" : "Guardar reordenamiento"}
        </Button></div>}
    </div>;
});
