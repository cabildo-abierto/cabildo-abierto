"use client";


import {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import type {BlockType, SaveTopicEditInput, SaveTopicEditOutput, TopicBlock, TopicEditableBlock, TopicEditorDataOutput} from "@cabildo-abierto/api";
import {compareContentBlocks, parseDocumentBlock, parseDatasetBlock, isAttachmentBlock, isRichTextEmpty, orderBetween, permutationFor, richTextPlainText} from "@cabildo-abierto/utils";
import {DotsSixVerticalIcon, PencilSimpleIcon} from "@phosphor-icons/react";
import {TopicDocumentEditor} from "@/components/documents/topic-document-editor";
import {TopicBlockContent} from "@/components/topic-block-content";
import {TopicBlockTools, topicBlockVersionsKey} from "@/components/topic-block-tools";
import {useMediaQuery} from "@/hooks/use-media-query";
import {TopicBlockInsertButton} from "@/components/topic-block-insert-button";
import {TopicBlockEditForm} from "@/components/topic-block-edit-form";
import {TopicEditActionsCard} from "@/components/topic-edit-actions-card";
import {TopicEditActionButtons} from "@/components/topic-edit-action-buttons";
import {post} from "@/utils/react/fetch";
import {cn} from "@/lib/utils";
import {TopicConvergenceNotice} from "@/components/topic-convergence-notice";
import {sameConvergence} from "@/components/topic-convergence";
import {TopicDeletedBlockItem, TopicDeletedBlocks} from "@/components/topic-deleted-blocks";
import {useTopicBlockSection} from "@/hooks/use-topic-block-section";
import {useTopicLocalConvergence} from "@/hooks/use-topic-local-convergence";
import {topicFootnotes} from "@/components/rich-text/topic-footnotes";
import {TopicFootnoteList} from "@/components/rich-text/topic-footnote-list";

type WorkingBlock = TopicBlock & {isNew: boolean; deleted: boolean};
type TopicEditState = {
    savedBlocks: WorkingBlock[]
    blocks: WorkingBlock[]
    activeBlockNumber: string | null
    showDeleted: boolean
    message: string
};
type ChangeKind = "new" | "content" | "order" | null;

function blockIsEmpty(block: Pick<TopicBlock, "typeId" | "content">): boolean {
    if (block.typeId === "dataset") return !parseDatasetBlock(block.content);
    if (block.typeId === "documento") return !parseDocumentBlock(block.content);
    return block.typeId === "parrafo" ? isRichTextEmpty(block.content) : !block.content.trim();
}

function newAttachmentBlock(typeId: "documento" | "dataset", id: string, content: string): WorkingBlock {
    return {id, blockNumber: id, typeId, content, order: "n", commentCount: 0, isNew: true, deleted: false};
}

function persistedBlocks(blocks: TopicEditableBlock[]): WorkingBlock[] {
    return blocks.map(block => ({...block, isNew: false}));
}

function emptyParagraph(): WorkingBlock {
    const localNumber = `new-${crypto.randomUUID()}`;
    return {
        id: localNumber,
        blockNumber: localNumber,
        typeId: "parrafo",
        content: "",
        order: "n",
        commentCount: 0,
        isNew: true,
        deleted: false,
    };
}

function stateFromSaved(savedBlocks: WorkingBlock[], activeBlockNumber: string | null = null): Pick<TopicEditState, "savedBlocks" | "blocks" | "activeBlockNumber"> {
    const blocks = [...savedBlocks];
    if (blocks.some(block => !block.deleted)) return {savedBlocks, blocks, activeBlockNumber};
    const paragraph = emptyParagraph();
    return {savedBlocks, blocks: [...blocks, paragraph], activeBlockNumber: paragraph.blockNumber};
}

function changeKind(block: WorkingBlock, savedByNumber: ReadonlyMap<string, WorkingBlock>): ChangeKind {
    if (block.isNew) return blockIsEmpty(block) ? null : "new";
    const saved = savedByNumber.get(block.blockNumber);
    if (!saved) return null;
    if (block.deleted) return null;
    if (saved.deleted !== block.deleted) return "content";
    if (block.content !== saved.content) return "content";
    if (!isAttachmentBlock(block.typeId) && block.order !== saved.order) return "order";
    return null;
}

function mergeConvergence(state: TopicEditState, latestBlocks: TopicEditableBlock[]): TopicEditState {
    const previousSavedByNumber = new Map(state.savedBlocks.map(block => [block.blockNumber, block]));
    const workingByNumber = new Map(state.blocks.filter(block => !block.isNew).map(block => [block.blockNumber, block]));
    const latest = persistedBlocks(latestBlocks).map(block => {
        const saved = previousSavedByNumber.get(block.blockNumber);
        const working = workingByNumber.get(block.blockNumber);
        if (!saved || !working) return block;
        const contentChanged = working.content !== saved.content;
        const orderChanged = !isAttachmentBlock(working.typeId) && working.order !== saved.order;
        const deletionChanged = working.deleted !== saved.deleted;
        return {
            ...block,
            content: contentChanged ? working.content : block.content,
            order: orderChanged ? working.order : block.order,
            deleted: deletionChanged ? working.deleted : contentChanged || orderChanged ? false : block.deleted,
        };
    });
    const localBlocks = state.blocks.filter(block => block.isNew);
    let blocks = [...latest, ...localBlocks]
        .sort(compareContentBlocks);
    const visibleBlocks = blocks.filter(block => !block.deleted && !isAttachmentBlock(block.typeId));
    const hasDuplicateOrder = visibleBlocks.some((block, index) => index > 0 && visibleBlocks[index - 1].order >= block.order);
    if (hasDuplicateOrder) {
        const orderByNumber = new Map(permutationFor(visibleBlocks.map(block => block.blockNumber))
            .map(item => [item.blockNumber, item.order]));
        blocks = blocks.map(block => block.deleted || isAttachmentBlock(block.typeId) ? block : {...block, order: orderByNumber.get(block.blockNumber)!})
            .sort(compareContentBlocks);
    }
    const savedBlocks = persistedBlocks(latestBlocks);
    const activeBlockNumber = blocks.some(block => !block.deleted && block.blockNumber === state.activeBlockNumber)
        ? state.activeBlockNumber
        : null;
    if (blocks.some(block => !block.deleted)) return {...state, savedBlocks, blocks, activeBlockNumber};
    const paragraph = emptyParagraph();
    return {...state, savedBlocks, blocks: [...blocks, paragraph], activeBlockNumber: paragraph.blockNumber};
}

function changeBarClass(kind: Exclude<ChangeKind, null>): string {
    if (kind === "new") return "bg-green-500";
    if (kind === "content") return "bg-yellow-500";
    return "bg-blue-500";
}

function deactivateBlock(state: TopicEditState, nextActiveBlockNumber: string | null): TopicEditState {
    const activeBlock = state.blocks.find(block => block.blockNumber === state.activeBlockNumber);
    if (!activeBlock || activeBlock.blockNumber === nextActiveBlockNumber || !blockIsEmpty(activeBlock)) {
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

export const TopicBlockEditor = forwardRef<TopicBlockEditorHandle, {topicId: string; initialBlocks: TopicEditableBlock[]; blockTypes: BlockType[]}>(function TopicBlockEditor({topicId, initialBlocks, blockTypes}, ref) {
    const openToolsInPage = useMediaQuery("(max-width: 1535px)") !== false;
    const queryClient = useQueryClient();
    const [edit, setEdit] = useState<TopicEditState>(() => {
        const blocks = persistedBlocks(initialBlocks);
        return {...stateFromSaved(blocks), showDeleted: false, message: ""};
    });
    const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);
    const [shaking, setShaking] = useState(false);
    const [toolbarContainer, setToolbarContainer] = useState<HTMLDivElement | null>(null);
    const blockSectionProps = useTopicBlockSection();
    const deletingVersion = useTopicLocalConvergence(topicId, blocks => {
        setEdit(current => mergeConvergence(current, blocks));
    });

    const savedByNumber = new Map(edit.savedBlocks.map(block => [block.blockNumber, block]));
    const changedBlocks = edit.blocks.filter(block => changeKind(block, savedByNumber) !== null);
    const newBlocks = edit.blocks.filter(block => block.isNew && !block.deleted);
    const modifiedBlockCount = changedBlocks.length + newBlocks.filter(block => changeKind(block, savedByNumber) === null).length;
    const deletedBlocks = edit.blocks.filter(block => block.deleted && !block.isNew && !savedByNumber.get(block.blockNumber)?.deleted);
    const deletedBlocksForDisplay = edit.blocks.filter(block => block.deleted && !block.isNew);
    const hasChanges = changedBlocks.length > 0 || deletedBlocks.length > 0;
    const affectedBlockCount = modifiedBlockCount + deletedBlocks.length;
    const showActionsCard = deletedBlocks.length > 0 || affectedBlockCount > 1;
    const requiresMessage = affectedBlockCount > 1;
    const singleChangedBlockNumber = !showActionsCard && changedBlocks.length === 1 ? changedBlocks[0].blockNumber : null;
    const hasInvalidBlock = uploading.size > 0 || edit.blocks.some(block => !block.deleted && (blockIsEmpty(block)
        || (block.typeId === "parrafo" && (richTextPlainText(block.content).length > 20_000 || block.content.length > 100_000))
        || ((block.typeId === "h1" || block.typeId === "h2") && /[\r\n]/.test(block.content))));
    const convergenceChanged = !saving && !deletingVersion && !sameConvergence(edit.savedBlocks, initialBlocks);

    useEffect(() => {
        const countsByNumber = new Map(initialBlocks.map(block => [block.blockNumber, block.commentCount]));
        setEdit(current => ({
            ...current,
            savedBlocks: current.savedBlocks.map(block => ({
                ...block,
                commentCount: countsByNumber.get(block.blockNumber) ?? block.commentCount,
            })),
            blocks: current.blocks.map(block => ({
                ...block,
                commentCount: countsByNumber.get(block.blockNumber) ?? block.commentCount,
            })),
        }));
    }, [initialBlocks]);

    useEffect(() => {
        const deactivateParagraphOnOutsidePointer = (event: PointerEvent) => {
            const target = event.target;
            if (!(target instanceof Element)) return;
            if (target.closest('[data-slot="select-content"], [data-attachment-editor-popup]')) return;
            setEdit(current => {
                const activeBlock = current.blocks.find(block => block.blockNumber === current.activeBlockNumber);
                if (!activeBlock || activeBlock.typeId !== "parrafo") return current;
                const clickedBlock = target.closest<HTMLElement>("[data-topic-editor-block]");
                if (clickedBlock?.dataset.topicEditorBlock === activeBlock.blockNumber) return current;
                return deactivateBlock(current, null);
            });
        };
        document.addEventListener("pointerdown", deactivateParagraphOnOutsidePointer);
        return () => document.removeEventListener("pointerdown", deactivateParagraphOnOutsidePointer);
    }, []);

    const shakeActions = () => {
        setShaking(false);
        requestAnimationFrame(() => setShaking(true));
    };

    useImperativeHandle(ref, () => ({
        canFinishEditing: () => {
            if (!hasChanges && !newBlocks.some(block => isAttachmentBlock(block.typeId)) && !uploading.size) return true;
            shakeActions();
            return false;
        },
    }));

    const attachmentInsertion = (typeId: "documento" | "dataset") => ({
        canSave: !hasChanges,
        saving,
        error,
        onChange: (id: string, content: string) => setEdit(current => {
            const document = newAttachmentBlock(typeId, id, content);
            const exists = current.blocks.some(block => block.id === id);
            return {...current, blocks: exists ? current.blocks.map(block => block.id === id ? document : block) : [...current.blocks, document]};
        }),
        onInsert: async (content: string) => {
            const id = `new-${crypto.randomUUID()}`;
            const blocks = edit.blocks.filter(block => !(block.isNew && !isAttachmentBlock(block.typeId) && blockIsEmpty(block)));
            const document = newAttachmentBlock(typeId, id, content);
            return save({...edit, blocks: [...blocks, document]});
        },
        onBusyChange: (busy: boolean) => setUploading(current => {
            const next = new Set(current);
            if (busy) next.add(`${typeId}-insertion`); else next.delete(`${typeId}-insertion`);
            return next;
        }),
    });

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
            const visibleBlocks = current.blocks.filter(block => !block.deleted && !isAttachmentBlock(block.typeId));
            const onlyEmptyParagraph = visibleBlocks.length === 1
                && after === null
                && visibleBlocks[0].isNew
                && blockIsEmpty(visibleBlocks[0]);
            const existingEmptyBlock = visibleBlocks.find(block => block.blockNumber === after && block.isNew && blockIsEmpty(block));
            if (onlyEmptyParagraph || existingEmptyBlock) {
                return {...current, activeBlockNumber: (existingEmptyBlock ?? visibleBlocks[0]).blockNumber};
            }
            const previousActive = current.blocks.find(block => block.blockNumber === current.activeBlockNumber);
            const visibleBeforeDeactivation = visibleBlocks;
            const previousActiveIndex = previousActive && blockIsEmpty(previousActive)
                ? visibleBeforeDeactivation.findIndex(block => block.blockNumber === previousActive.blockNumber)
                : -1;
            const insertionAnchor = after === previousActive?.blockNumber && previousActiveIndex >= 0
                ? visibleBeforeDeactivation[previousActiveIndex - 1]?.blockNumber ?? null
                : after;
            const deactivated = deactivateBlock(current, null);
            const deactivatedVisibleBlocks = deactivated.blocks.filter(block => !block.deleted && !isAttachmentBlock(block.typeId));
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
            const blocks = [...deactivated.blocks, block].sort(compareContentBlocks);
            return {...deactivated, blocks, activeBlockNumber: localNumber};
        });
        setError(null);
    };

    const removeEmptyBlock = (blockNumber: string) => {
        setEdit(current => {
            const block = current.blocks.find(candidate => candidate.blockNumber === blockNumber);
            if (!block || !blockIsEmpty(block)) return current;
            return deactivateBlock({...current, activeBlockNumber: blockNumber}, null);
        });
    };

    const restoreBlock = (blockNumber: string) => {
        setEdit(current => {
            const saved = current.savedBlocks.find(block => block.blockNumber === blockNumber);
            if (!saved) return current;
            const blocks = current.blocks.map(block => block.blockNumber === blockNumber ? {...saved, deleted: false} : block)
                .sort(compareContentBlocks);
            return {...current, blocks, activeBlockNumber: blockNumber};
        });
    };

    const moveDraggedBlock = (target: string) => {
        if (!draggedBlock || draggedBlock === target) return;
        setEdit(current => {
            const visibleBlocks = current.blocks.filter(block => !block.deleted && !isAttachmentBlock(block.typeId));
            const from = visibleBlocks.findIndex(block => block.blockNumber === draggedBlock);
            const to = visibleBlocks.findIndex(block => block.blockNumber === target);
            if (from === -1 || to === -1) return current;
            const reordered = [...visibleBlocks];
            const [moved] = reordered.splice(from, 1);
            reordered.splice(to, 0, moved);
            const orderByNumber = new Map(permutationFor(reordered.map(block => block.blockNumber))
                .map(item => [item.blockNumber, item.order]));
            const blocks = current.blocks.map(block => block.deleted || isAttachmentBlock(block.typeId) ? block : {...block, order: orderByNumber.get(block.blockNumber)!})
                .sort(compareContentBlocks);
            return {...current, blocks};
        });
    };

    const cancel = () => {
        setEdit(current => ({...stateFromSaved(current.savedBlocks), showDeleted: false, message: ""}));
        setError(null);
        setShaking(false);
    };

    const save = async (state = edit) => {
        const saved = new Map(state.savedBlocks.map(block => [block.blockNumber, block]));
        const changed = state.blocks.filter(block => changeKind(block, saved) !== null);
        const deleted = state.blocks.filter(block => block.deleted && !block.isNew && !saved.get(block.blockNumber)?.deleted);
        const multiple = changed.length + deleted.length > 1;
        setSaving(true);
        setError(null);
        const input: SaveTopicEditInput = {
            message: multiple ? state.message.trim() : null,
            baseBlocks: state.savedBlocks.map(block => ({
                id: block.id,
                blockNumber: block.blockNumber,
                typeId: block.typeId,
                content: block.content,
                order: block.order,
                deleted: block.deleted,
            })),
            blocks: state.blocks.map(block => ({
                id: block.isNew ? null : block.id,
                blockNumber: block.isNew ? null : block.blockNumber,
                typeId: block.typeId,
                content: block.content,
                order: block.order,
                deleted: block.deleted,
            })),
        };
        const result = await post<SaveTopicEditInput, SaveTopicEditOutput>(`/topics/${encodeURIComponent(topicId)}/edits`, input);
        if ("error" in result) {
            setSaving(false);
            setError(result.error);
            if (result.error.includes("convergencia")) {
                void queryClient.invalidateQueries({queryKey: ["topic", topicId, "editor-data"]});
            }
            return false;
        }
        const editorDataKey = ["topic", topicId, "editor-data"];
        // Prevent an older in-flight snapshot from replacing the saved convergence.
        await queryClient.cancelQueries({queryKey: editorDataKey, exact: true});
        queryClient.setQueryData<TopicEditorDataOutput>(editorDataKey, current => current
            ? {...current, blocks: result.value.blocks}
            : {blocks: result.value.blocks, blockTypes});
        for (const block of [...changed, ...deleted]) {
            if (!block.isNew) void queryClient.invalidateQueries({queryKey: topicBlockVersionsKey(topicId, block.blockNumber)});
        }
        const blocks = persistedBlocks(result.value.blocks);
        setEdit({...stateFromSaved(blocks), showDeleted: false, message: ""});
        setSaving(false);
        void queryClient.invalidateQueries({queryKey: ["topic", topicId], refetchType: "all"});
        return true;
    };

    const visibleBlocks = edit.blocks.filter(block => !isAttachmentBlock(block.typeId) && (!block.deleted || (edit.showDeleted && !block.isNew)));
    const {footnotes, numberById} = topicFootnotes(edit.blocks.filter(block => !block.deleted));
    return <div className="flex flex-1 flex-col gap-3">
        {convergenceChanged && <TopicConvergenceNotice onUpdate={() => {
            setEdit(current => mergeConvergence(current, initialBlocks));
            setError(null);
        }}/>}
        <TopicDeletedBlocks topicId={topicId} count={deletedBlocksForDisplay.length} open={edit.showDeleted}
            onToggle={() => setEdit(current => ({...current, showDeleted: !current.showDeleted}))}/>
        {edit.showDeleted && deletedBlocksForDisplay.length === 0 && <p className="text-xs text-muted-foreground">No hay bloques eliminados.</p>}
        <div className="relative flex flex-1 flex-col gap-0">
        {!saving && (visibleBlocks.length === 0 || !blockIsEmpty(visibleBlocks[0])) && <div className="absolute inset-x-0 top-0 z-10 -translate-y-1/2">
            <TopicBlockInsertButton onClick={() => startNewBlock(null)}/>
        </div>}
        {visibleBlocks.map((block, index) => {
            const kind = changeKind(block, savedByNumber);
            const active = edit.activeBlockNumber === block.blockNumber;
            return <div key={block.blockNumber} className="contents">
                <div className="group/block relative">
                    <div
                        className={cn("relative", draggedBlock === block.blockNumber && "opacity-50")}
                        data-topic-editor-block={block.blockNumber}
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
                        {block.deleted ? <TopicDeletedBlockItem block={block} topicId={topicId} openInPage={openToolsInPage}
                            newlyDeleted={!savedByNumber.get(block.blockNumber)?.deleted}
                            onRestore={() => restoreBlock(block.blockNumber)} toolsProps={blockSectionProps(block.blockNumber)}/>
                        : active ? <TopicBlockEditForm block={block} isNew={block.isNew} blockTypes={blockTypes} footnoteNumbers={numberById} toolbarContainer={toolbarContainer}
                            documentInsertion={attachmentInsertion("documento")} datasetInsertion={attachmentInsertion("dataset")} onChange={updateBlock} onDeleteEmpty={() => removeEmptyBlock(block.blockNumber)}/>
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
                            <TopicBlockContent block={block} linksEnabled={false} showExternalLinkIcon footnoteNumbers={numberById}/>
                            <span className="pointer-events-none absolute top-3 right-full mr-2 inline-flex items-center gap-1 text-[10px] whitespace-nowrap text-muted-foreground opacity-0 transition-opacity group-hover/edit:opacity-100 group-focus-visible/edit:opacity-100">
                                <DotsSixVerticalIcon className="size-4" aria-hidden="true"/>{!block.isNew && block.blockNumber}
                            </span>
                            <PencilSimpleIcon className="pointer-events-none absolute top-3 right-3 size-4 text-muted-foreground opacity-0 group-hover/edit:opacity-100 group-focus-visible/edit:opacity-100"/>
                        </article>}
                    </div>
                    {active && (block.typeId === "parrafo" || singleChangedBlockNumber === block.blockNumber) && <div
                        className="flex items-start justify-between gap-2 pt-2 pb-2" draggable={false}
                        data-topic-editor-block={block.blockNumber}
                        onDragStart={event => event.stopPropagation()}>
                        <div ref={setToolbarContainer} className="min-w-0"/>
                        {singleChangedBlockNumber === block.blockNumber && <div
                            className={cn("flex flex-col items-end gap-2", shaking && "animate-[block-shake_180ms_ease-in-out]")}
                            onAnimationEnd={() => setShaking(false)}>
                            {error && <p className="text-xs text-destructive">{error}</p>}
                            <TopicEditActionButtons saving={saving || uploading.size > 0} saveDisabled={hasInvalidBlock} onCancel={cancel} onSave={() => void save()}/>
                        </div>}
                    </div>}
                    {!block.isNew && !block.deleted && <TopicBlockTools
                        topicId={topicId}
                        block={block}
                        openInPage={openToolsInPage}
                        {...blockSectionProps(block.blockNumber)}
                    />}
                </div>
                {!saving && !block.deleted && !blockIsEmpty(block) && (index < visibleBlocks.length - 1
                    ? !blockIsEmpty(visibleBlocks[index + 1]) && <TopicBlockInsertButton onClick={() => startNewBlock(block.blockNumber)}/>
                    : <TopicBlockInsertButton onClick={() => startNewBlock(block.blockNumber)}/>)}
            </div>;
        })}
        {(["documento", "dataset"] as const).map(type => <TopicDocumentEditor key={type} dataset={type === "dataset"} topicId={topicId} blocks={edit.blocks.filter(block => block.typeId === type && (!block.deleted || edit.showDeleted))}
            insertionAction={attachmentInsertion(type)} disabled={saving || uploading.size > 0} onChange={updateBlock} onRestore={restoreBlock}
            renderActions={(blockNumber, onClose) => (!hasChanges || singleChangedBlockNumber === blockNumber) && <div className={cn("flex flex-col items-end gap-2", shaking && "animate-[block-shake_180ms_ease-in-out]")}
                onAnimationEnd={() => setShaking(false)}>
                {error && <p role="alert" className={cn("text-xs text-destructive")}>{error}</p>}
                <TopicEditActionButtons saving={saving || uploading.size > 0} saveDisabled={!hasChanges || hasInvalidBlock} onCancel={() => { cancel(); onClose(); }} onSave={() => { void save().then(saved => { if (saved) onClose(); }); }}/>
            </div>}
            onBusyChange={(blockNumber, busy) => setUploading(current => {
                const next = new Set(current); if (busy) next.add(blockNumber); else next.delete(blockNumber); return next;
            })}
            onRemove={blockNumber => setEdit(current => ({...current, blocks: current.blocks.flatMap(block => block.blockNumber !== blockNumber ? [block] : block.isNew ? [] : [{...block, deleted: true}])}))}/>) }
        <TopicFootnoteList footnotes={footnotes}/>
        {showActionsCard && <TopicEditActionsCard
            modifiedCount={modifiedBlockCount}
            deletedCount={deletedBlocks.length}
            deletedBlockNumber={deletedBlocks[0]?.blockNumber}
            message={edit.message}
            requiresMessage={requiresMessage}
            saving={saving || uploading.size > 0}
            saveDisabled={hasInvalidBlock || (requiresMessage && !edit.message.trim())}
            error={error}
            shaking={shaking}
            onMessageChange={message => setEdit(current => ({...current, message}))}
            onCancel={cancel}
            onSave={() => void save()}
            onShakeEnd={() => setShaking(false)}/>}
        </div>
    </div>;
});
