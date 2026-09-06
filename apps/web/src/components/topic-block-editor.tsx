"use client"

import {forwardRef, useImperativeHandle, useState} from "react";
import type {BlockType, SaveBlockInput, SaveBlockOutput, TopicBlock} from "@cabildo-abierto/api";
import {PencilSimpleIcon, PlusIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {TopicBlockContent} from "@/components/topic-block";
import {patch, post} from "@/utils/react/fetch";

type Draft = {typeId: BlockType["id"]; content: string};

function BlockTypeIcon({typeId}: {typeId: BlockType["id"]}) {
    if (typeId === "h1") return <span className="inline-flex h-4 min-w-4 items-center justify-center text-sm font-semibold leading-none" aria-hidden="true">T1</span>;
    if (typeId === "h2") return <span className="inline-flex h-4 min-w-4 items-center justify-center text-sm font-semibold leading-none" aria-hidden="true">T2</span>;
    return <span className="inline-flex size-4 items-center justify-center text-sm font-semibold leading-none" aria-hidden="true">P</span>;
}

function BlockForm({draft, blockNumber, types, saving, error, onChange, onSave, onCancel, shaking, onShakeEnd}: {
    draft: Draft
    blockNumber?: string
    types: BlockType[]
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
        className={`relative -mx-3 space-y-3 px-3 py-2 ${shaking ? "animate-[block-shake_180ms_ease-in-out]" : ""}`}
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
            className={`h-auto rounded-none border-0 bg-transparent px-0 py-0 font-semibold shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent ${draft.typeId === "h1" ? "text-xl md:text-xl" : "text-lg md:text-lg"}`}
            maxLength={20_000}
            autoFocus
        />}
        {blockNumber && <span className="absolute top-3 right-full mr-2 text-[10px] whitespace-nowrap text-muted-foreground">{blockNumber}</span>}
        {error && <p className="text-xs text-destructive">{error}</p>}
        <div className="flex flex-wrap items-center justify-between gap-3">
            <Select value={draft.typeId} onValueChange={changeType}>
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
    const [draft, setDraft] = useState<Draft>({typeId: "parrafo", content: ""});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [shaking, setShaking] = useState(false);

    const hasUnsavedChanges = () => {
        if (newDraft) return draft.typeId !== "parrafo" || draft.content !== "";
        const original = blocks.find(block => block.id === editingId);
        return original ? original.typeId !== draft.typeId || original.content !== draft.content : false;
    };
    const shakeActiveBlock = () => {
        setShaking(false);
        requestAnimationFrame(() => setShaking(true));
    };

    useImperativeHandle(ref, () => ({
        canFinishEditing: () => {
            if (!hasUnsavedChanges()) return true;
            shakeActiveBlock();
            return false;
        },
    }));

    const edit = (block: TopicBlock) => {
        setEditingId(block.id);
        setNewDraft(false);
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
        const input: SaveBlockInput = draft;
        const result = editingId
            ? await patch<SaveBlockInput, SaveBlockOutput>(`/topics/${encodeURIComponent(topicId)}/blocks/${encodeURIComponent(editingId)}`, input)
            : await post<SaveBlockInput, SaveBlockOutput>(`/topics/${encodeURIComponent(topicId)}/blocks`, input);
        setSaving(false);
        if ("error" in result) {
            setError(result.error);
            return;
        }
        setBlocks(current => editingId
            ? current.map(block => block.id === editingId ? result.value.block : block)
            : [...current, result.value.block]);
        cancel();
    };

    return <div className="space-y-2">
        {blocks.map(block => editingId === block.id ? <BlockForm
            key={block.id} draft={draft} types={blockTypes} saving={saving} error={error}
            blockNumber={block.blockNumber}
            onChange={setDraft} onSave={() => void save()} onCancel={cancel}
            shaking={shaking} onShakeEnd={() => setShaking(false)}
        /> : <article
            key={block.id}
            className="group relative -mx-3 cursor-text rounded-lg px-3 py-2 outline-none hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/30"
            role="button"
            tabIndex={0}
            aria-label={`Editar bloque ${block.blockNumber}`}
            onClick={() => requestEdit(block)}
            onKeyDown={event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    requestEdit(block);
                }
            }}
        >
            <TopicBlockContent block={block}/>
            <span className="absolute top-3 right-full mr-2 text-[10px] whitespace-nowrap text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">{block.blockNumber}</span>
            <PencilSimpleIcon className="pointer-events-none absolute top-3 right-3 text-muted-foreground opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"/>
        </article>)}
        {newDraft && <BlockForm draft={draft} types={blockTypes} saving={saving} error={error} onChange={setDraft} onSave={() => void save()} onCancel={cancel} shaking={shaking} onShakeEnd={() => setShaking(false)}/>} 
        {editingId === null && !newDraft && <Button type="button" variant="outline" className="mt-4" onClick={() => {
            setDraft({typeId: "parrafo", content: ""});
            setNewDraft(true);
            setError(null);
        }}>
            <PlusIcon/>
            Nuevo bloque
        </Button>}
    </div>;
});
