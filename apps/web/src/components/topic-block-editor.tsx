"use client"

import {forwardRef, useImperativeHandle, useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import type {BlockType, SaveTopicEditInput, SaveTopicEditOutput, TopicBlock} from "@cabildo-abierto/api";
import {orderBetween, permutationFor} from "@cabildo-abierto/utils";
import {ArrowCounterClockwiseIcon, DotsSixVerticalIcon, PencilSimpleIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {TopicBlockContent} from "@/components/topic-block-content";
import {TopicBlockTools, topicBlockVersionsKey} from "@/components/topic-block-tools";
import {TopicBlockInsertButton} from "@/components/topic-block-insert-button";
import {TopicBlockEditForm} from "@/components/topic-block-edit-form";
import {TopicEditActionsCard} from "@/components/topic-edit-actions-card";
import {TopicEditActionButtons} from "@/components/topic-edit-action-buttons";
import {post} from "@/utils/react/fetch";
import {cn} from "@/lib/utils";

type WorkingBlock = TopicBlock & {isNew: boolean; deleted: boolean};
type TopicEditState = {
    savedBlocks: WorkingBlock[]
    blocks: WorkingBlock[]
    activeBlockNumber: string | null
    showDeleted: boolean
    message: string
};
type ChangeKind = "new" | "content" | "order" | null;

function persistedBlocks(blocks: TopicBlock[]): WorkingBlock[] {
    return blocks.map(block => ({...block, isNew: false, deleted: false}));
}

function changeKind(block: WorkingBlock, savedByNumber: ReadonlyMap<string, WorkingBlock>): ChangeKind {
    if (block.deleted) return null;
    if (block.isNew) return block.content === "" ? null : "new";
    const saved = savedByNumber.get(block.blockNumber);
    if (!saved) return null;
    if (block.content !== saved.content) return "content";
    if (block.order !== saved.order) return "order";
    return null;
}

function changeBarClass(kind: Exclude<ChangeKind, null>): string {
    if (kind === "new") return "bg-green-500";
    if (kind === "content") return "bg-yellow-500";
    return "bg-blue-500";
}

function deactivateBlock(state: TopicEditState, nextActiveBlockNumber: string | null): TopicEditState {
    const activeBlock = state.blocks.find(block => block.blockNumber === state.activeBlockNumber);
    if (!activeBlock || activeBlock.blockNumber === nextActiveBlockNumber || activeBlock.content !== "") {
        return {...state, activeBlockNumber: nextActiveBlockNumber};
    }
    if (activeBlock.isNew) {
        return {
            ...state,
            blocks: state.blocks.filter(block => block.blockNumber !== activeBlock.blockNumber),
            activeBlockNumber: nextActiveBlockNumber,
        };
    }
    const saved = state.savedBlocks.find(block => block.blockNumber === activeBlock.blockNumber)!;
    return {
        ...state,
        blocks: state.blocks.map(block => block.blockNumber === activeBlock.blockNumber ? {...saved, deleted: true} : block),
        activeBlockNumber: nextActiveBlockNumber,
    };
}

export type TopicBlockEditorHandle = {
    canFinishEditing: () => boolean
};

export const TopicBlockEditor = forwardRef<TopicBlockEditorHandle, {topicId: string; initialBlocks: TopicBlock[]; blockTypes: BlockType[]}>(function TopicBlockEditor({topicId, initialBlocks, blockTypes}, ref) {
    const queryClient = useQueryClient();
    const [edit, setEdit] = useState<TopicEditState>(() => {
        const blocks = persistedBlocks(initialBlocks);
        if (blocks.length === 0) {
            const emptyParagraph: WorkingBlock = {
                id: "new-empty-paragraph",
                blockNumber: "new-empty-paragraph",
                typeId: "parrafo",
                content: "",
                order: "n",
                commentCount: 0,
                isNew: true,
                deleted: false,
            };
            return {savedBlocks: [], blocks: [emptyParagraph], activeBlockNumber: emptyParagraph.blockNumber, showDeleted: false, message: ""};
        }
        return {savedBlocks: blocks, blocks, activeBlockNumber: null, showDeleted: false, message: ""};
    });
    const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [shaking, setShaking] = useState(false);

    const savedByNumber = new Map(edit.savedBlocks.map(block => [block.blockNumber, block]));
    const changedBlocks = edit.blocks.filter(block => changeKind(block, savedByNumber) !== null);
    const newBlocks = edit.blocks.filter(block => block.isNew && !block.deleted);
    const modifiedBlockCount = changedBlocks.length + newBlocks.filter(block => changeKind(block, savedByNumber) === null).length;
    const deletedBlocks = edit.blocks.filter(block => block.deleted);
    const hasChanges = changedBlocks.length > 0 || deletedBlocks.length > 0;
    const affectedBlockCount = modifiedBlockCount + deletedBlocks.length;
    const showActionsCard = deletedBlocks.length > 0 || affectedBlockCount > 1;
    const requiresMessage = affectedBlockCount > 1;
    const singleChangedBlockNumber = !showActionsCard && changedBlocks.length === 1 ? changedBlocks[0].blockNumber : null;
    const hasInvalidBlock = edit.blocks.some(block => !block.deleted && (!block.content.trim()
        || (block.typeId !== "parrafo" && /[\r\n]/.test(block.content))));

    const shakeActions = () => {
        setShaking(false);
        requestAnimationFrame(() => setShaking(true));
    };

    useImperativeHandle(ref, () => ({
        canFinishEditing: () => {
            if (!hasChanges) return true;
            shakeActions();
            return false;
        },
    }));

    const updateBlock = (updated: TopicBlock) => {
        setEdit(current => ({
            ...current,
            blocks: current.blocks.map(block => block.blockNumber === updated.blockNumber
                ? {...block, ...updated}
                : block),
        }));
        setError(null);
    };

    const activateBlock = (blockNumber: string) => {
        setEdit(current => deactivateBlock(current, blockNumber));
        setError(null);
    };

    const startNewBlock = (after: string | null) => {
        setEdit(current => {
            const visibleBlocks = current.blocks.filter(block => !block.deleted);
            const onlyEmptyParagraph = visibleBlocks.length === 1
                && after === null
                && visibleBlocks[0].isNew
                && visibleBlocks[0].content === "";
            const existingEmptyBlock = visibleBlocks.find(block => block.blockNumber === after && block.isNew && block.content === "");
            if (onlyEmptyParagraph || existingEmptyBlock) {
                return {...current, activeBlockNumber: (existingEmptyBlock ?? visibleBlocks[0]).blockNumber};
            }
            const previousActive = current.blocks.find(block => block.blockNumber === current.activeBlockNumber);
            const visibleBeforeDeactivation = visibleBlocks;
            const previousActiveIndex = previousActive && previousActive.content === ""
                ? visibleBeforeDeactivation.findIndex(block => block.blockNumber === previousActive.blockNumber)
                : -1;
            const insertionAnchor = after === previousActive?.blockNumber && previousActiveIndex >= 0
                ? visibleBeforeDeactivation[previousActiveIndex - 1]?.blockNumber ?? null
                : after;
            const deactivated = deactivateBlock(current, null);
            const deactivatedVisibleBlocks = deactivated.blocks.filter(block => !block.deleted);
            const anchorIndex = insertionAnchor === null ? -1 : deactivatedVisibleBlocks.findIndex(block => block.blockNumber === insertionAnchor);
            const previousBlock = deactivatedVisibleBlocks[anchorIndex];
            const nextBlock = deactivatedVisibleBlocks[anchorIndex + 1];
            const localNumber = `new-${crypto.randomUUID()}`;
            const block: WorkingBlock = {
                id: localNumber,
                blockNumber: localNumber,
                typeId: "parrafo",
                content: "",
                order: orderBetween(previousBlock?.order ?? null, nextBlock?.order ?? null),
                commentCount: 0,
                isNew: true,
                deleted: false,
            };
            const blocks = [...deactivated.blocks, block].sort((left, right) => left.order.localeCompare(right.order));
            return {...deactivated, blocks, activeBlockNumber: localNumber};
        });
        setError(null);
    };

    const removeEmptyBlock = (blockNumber: string) => {
        setEdit(current => {
            const block = current.blocks.find(candidate => candidate.blockNumber === blockNumber);
            if (!block || block.content !== "") return current;
            return deactivateBlock({...current, activeBlockNumber: blockNumber}, null);
        });
    };

    const restoreBlock = (blockNumber: string) => {
        setEdit(current => {
            const saved = current.savedBlocks.find(block => block.blockNumber === blockNumber);
            if (!saved) return current;
            const blocks = current.blocks.map(block => block.blockNumber === blockNumber ? saved : block)
                .sort((left, right) => left.order.localeCompare(right.order));
            return {...current, blocks};
        });
    };

    const moveDraggedBlock = (target: string) => {
        if (!draggedBlock || draggedBlock === target) return;
        setEdit(current => {
            const visibleBlocks = current.blocks.filter(block => !block.deleted);
            const from = visibleBlocks.findIndex(block => block.blockNumber === draggedBlock);
            const to = visibleBlocks.findIndex(block => block.blockNumber === target);
            if (from === -1 || to === -1) return current;
            const reordered = [...visibleBlocks];
            const [moved] = reordered.splice(from, 1);
            reordered.splice(to, 0, moved);
            const orderByNumber = new Map(permutationFor(reordered.map(block => block.blockNumber))
                .map(item => [item.blockNumber, item.order]));
            const blocks = current.blocks.map(block => block.deleted ? block : {...block, order: orderByNumber.get(block.blockNumber)!})
                .sort((left, right) => left.order.localeCompare(right.order));
            return {...current, blocks};
        });
    };

    const cancel = () => {
        setEdit(current => ({savedBlocks: current.savedBlocks, blocks: current.savedBlocks, activeBlockNumber: null, showDeleted: false, message: ""}));
        setError(null);
        setShaking(false);
    };

    const save = async () => {
        setSaving(true);
        setError(null);
        const input: SaveTopicEditInput = {
            message: requiresMessage ? edit.message.trim() : null,
            blocks: edit.blocks.map(block => ({
                id: block.isNew ? null : block.id,
                blockNumber: block.isNew ? null : block.blockNumber,
                typeId: block.typeId,
                content: block.content,
                order: block.order,
                deleted: block.deleted,
            })),
        };
        const result = await post<SaveTopicEditInput, SaveTopicEditOutput>(`/topics/${encodeURIComponent(topicId)}/edits`, input);
        setSaving(false);
        if ("error" in result) {
            setError(result.error);
            return;
        }
        for (const block of [...changedBlocks, ...deletedBlocks]) {
            if (!block.isNew) void queryClient.invalidateQueries({queryKey: topicBlockVersionsKey(topicId, block.blockNumber)});
        }
        const blocks = persistedBlocks(result.value.blocks);
        setEdit({savedBlocks: blocks, blocks, activeBlockNumber: null, showDeleted: false, message: ""});
    };

    const visibleBlocks = edit.blocks.filter(block => !block.deleted || edit.showDeleted);
    return <div className={cn("relative flex flex-1 flex-col", edit.activeBlockNumber === null ? "gap-0" : "gap-2")}
        onClick={event => {
            if (event.target === event.currentTarget) startNewBlock(visibleBlocks.at(-1)?.blockNumber ?? null);
        }}>
        {!saving && (visibleBlocks.length === 0 || visibleBlocks[0].content !== "") && <div className="absolute inset-x-0 top-0 z-10 -translate-y-1/2">
            <TopicBlockInsertButton onClick={() => startNewBlock(null)}/>
        </div>}
        {visibleBlocks.map((block, index) => {
            const kind = changeKind(block, savedByNumber);
            const active = edit.activeBlockNumber === block.blockNumber;
            return <div key={block.blockNumber} className="contents">
                <div className="group/block relative">
                    <div
                        className={cn("relative", draggedBlock === block.blockNumber && "opacity-50")}
                        draggable={!saving && !block.deleted}
                        onDragStart={event => {
                            event.dataTransfer.setData("text/plain", block.blockNumber);
                            event.dataTransfer.effectAllowed = "move";
                            setDraggedBlock(block.blockNumber);
                        }}
                        onDragEnter={() => { if (!block.deleted) moveDraggedBlock(block.blockNumber); }}
                        onDragOver={event => event.preventDefault()}
                        onDragEnd={() => setDraggedBlock(null)}>
                        {kind && <span className={cn("absolute top-2 bottom-2 -left-3 w-1 rounded-full", changeBarClass(kind))} aria-hidden="true"/>}
                        {block.deleted ? <div className="-mx-3 flex items-start gap-3 rounded-lg bg-muted/40 px-3 py-2 text-muted-foreground">
                            <div className="min-w-0 flex-1 opacity-60"><TopicBlockContent block={block}/></div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => restoreBlock(block.blockNumber)}>
                                <ArrowCounterClockwiseIcon/>Restaurar
                            </Button>
                        </div>
                        : active ? <TopicBlockEditForm block={block} isNew={block.isNew} blockTypes={blockTypes} onChange={updateBlock} onDeleteEmpty={() => removeEmptyBlock(block.blockNumber)}/>
                        : <article
                            className="group/edit relative -mx-3 cursor-text rounded-lg px-3 py-2 outline-none hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/30"
                            role="button"
                            tabIndex={0}
                            aria-label={`Editar bloque ${block.blockNumber}`}
                            onClick={() => activateBlock(block.blockNumber)}
                            onKeyDown={event => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    activateBlock(block.blockNumber);
                                }
                            }}>
                            <TopicBlockContent block={block}/>
                            <span className="pointer-events-none absolute top-3 right-full mr-2 inline-flex items-center gap-1 text-[10px] whitespace-nowrap text-muted-foreground opacity-0 transition-opacity group-hover/edit:opacity-100 group-focus-visible/edit:opacity-100">
                                <DotsSixVerticalIcon className="size-4" aria-hidden="true"/>{!block.isNew && block.blockNumber}
                            </span>
                            <PencilSimpleIcon className="pointer-events-none absolute top-3 right-3 size-4 text-muted-foreground opacity-0 group-hover/edit:opacity-100 group-focus-visible/edit:opacity-100"/>
                        </article>}
                    </div>
                    {active && singleChangedBlockNumber === block.blockNumber && <div
                        className={cn("space-y-2 pt-2", shaking && "animate-[block-shake_180ms_ease-in-out]")}
                        draggable={false} onDragStart={event => event.stopPropagation()} onAnimationEnd={() => setShaking(false)}>
                        {error && <p className="text-xs text-destructive">{error}</p>}
                        <TopicEditActionButtons saving={saving} saveDisabled={hasInvalidBlock} onCancel={cancel} onSave={() => void save()}/>
                    </div>}
                    {!block.isNew && !block.deleted && <TopicBlockTools topicId={topicId} block={block} buttonClassName={active ? "-translate-x-3" : undefined}/>}
                </div>
                {!saving && !block.deleted && block.content !== "" && (index < visibleBlocks.length - 1
                    ? visibleBlocks[index + 1].content !== "" && <TopicBlockInsertButton onClick={() => startNewBlock(block.blockNumber)}/>
                    : <TopicBlockInsertButton fillRemainingSpace onClick={() => startNewBlock(block.blockNumber)}/>)}
            </div>;
        })}
        {showActionsCard && <TopicEditActionsCard
            modifiedCount={modifiedBlockCount}
            deletedBlockNumbers={deletedBlocks.map(block => block.blockNumber)}
            showDeleted={edit.showDeleted}
            message={edit.message}
            requiresMessage={requiresMessage}
            saving={saving}
            saveDisabled={hasInvalidBlock || (requiresMessage && !edit.message.trim())}
            error={error}
            shaking={shaking}
            onMessageChange={message => setEdit(current => ({...current, message}))}
            onToggleDeleted={() => setEdit(current => ({...current, showDeleted: !current.showDeleted}))}
            onCancel={cancel}
            onSave={() => void save()}
            onShakeEnd={() => setShaking(false)}/>}
    </div>;
});
