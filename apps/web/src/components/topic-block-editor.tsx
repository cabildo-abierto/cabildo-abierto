"use client";
import {EditableTableBlock} from '@/components/tables/editable-table-block';
import {TableEditorPopup} from '@/components/tables/table-editor-popup';

import {blockIsEmpty, blockContentIsInvalid} from "@/components/topic-block-content-validation";
import {TopicFootnoteProvider} from "@/components/rich-text/topic-footnote-context";
import {ImageEditorPopup} from "@/components/images/image-editor-popup";
import {EditableImageBlock} from "@/components/images/editable-image-block";
import {TopicBlockFrame} from "@/components/images/topic-block-frame";
import {TopicContentFlow} from "@/components/images/topic-content-flow";
import {VisualizationEditorPopup} from '@/components/visualizations/visualization-editor-popup';
import {VisualizationBlock} from '@/components/visualizations/visualization-block';
import {VisualizationEditActions} from '@/components/visualizations/visualization-edit-actions';


import {forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {useToast} from "@/components/ui/toast";
import type {SaveTopicEditInput, SaveTopicEditOutput, TopicBlock, TopicEditableBlock, TopicBlocksOutput} from "@cabildo-abierto/api";
import {compareContentBlocks, isAttachmentBlock, orderBetween} from "@cabildo-abierto/utils";
import {DotsSixVerticalIcon, PencilSimpleIcon} from "@phosphor-icons/react";
import {changeKind, deactivateBlock, editableTopicBlocks, mergeConvergence, newAttachmentBlock, persistedBlocks, stageAttachment, stateFromSaved, topicEditChanges, type ChangeKind, type TopicEditState, type WorkingBlock} from '@/components/topic-editor-state';
import {TopicDocumentEditor} from "@/components/documents/topic-document-editor";
import {TopicBlockContent} from "@/components/topic-block-content";
import {TopicBlockTools, topicBlockVersionsKey} from "@/components/topic-block-tools";
import {useMediaQuery} from "@/hooks/use-media-query";
import {TopicBlockInsertButton} from "@/components/topic-block-insert-button";
import {TopicBlockEditForm} from "@/components/topic-block-edit-form";
import {TopicEditActionsCard} from "@/components/topic-edit-actions-card";
import {TopicEditActionButtons} from "@/components/topic-edit-action-buttons";
import {get, post} from "@/utils/react/fetch";
import {cn} from "@/lib/utils";
import {TopicConvergenceNotice} from "@/components/topic-convergence-notice";
import {sameConvergence} from "@/components/topic-convergence";
import {TopicDeletedBlockItem, TopicDeletedBlocks} from "@/components/topic-deleted-blocks";
import {useTopicBlockSection} from "@/hooks/use-topic-block-section";
import {useTopicLocalConvergence} from "@/hooks/use-topic-local-convergence";
import {useTopicFootnotes} from "@/hooks/use-topic-footnotes";
import {normalizeTopicBlockOrders} from "@/components/topic-block-order";
import {TopicFootnoteList} from "@/components/rich-text/topic-footnote-list";

function changeBarClass(kind: Exclude<ChangeKind, null>): string {
    if (kind === "new") return "bg-green-500";
    if (kind === "content") return "bg-yellow-500";
    return "bg-blue-500";
}

export type TopicBlockEditorHandle = {
    canFinishEditing: () => boolean
};

export const TopicBlockEditor = forwardRef<TopicBlockEditorHandle, {topicId: string; data: TopicBlocksOutput}>(function TopicBlockEditor({topicId, data}, ref) {
    const initialBlocks = useMemo(() => editableTopicBlocks(data), [data]);
    const blockTypes = data.blockTypes;
    const openToolsInPage = useMediaQuery("(max-width: 1535px)") !== false;
    const queryClient = useQueryClient();
    const {toast} = useToast();
    const [edit, setEdit] = useState<TopicEditState>(() => {
        const blocks = persistedBlocks(initialBlocks);
        return {...stateFromSaved(blocks), showDeleted: false, message: ""};
    });
    const [inlinePopup, setInlinePopup] = useState<{typeId: "imagen" | "visualizacion" | "tabla"; blockNumber?: string; after?: string; content?: string} | null>(null);
    const [validVisualizations, setValidVisualizations] = useState<Map<string,string>>(new Map());
    const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);
    const [conflict, setConflict] = useState(false);
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
    const deletedAttachmentChanges = edit.blocks.filter(block => isAttachmentBlock(block.typeId) && !block.isNew).reduce((count, block) =>
        count + Number(block.deleted) - Number(savedByNumber.get(block.blockNumber)?.deleted ?? false), 0);
    const deletedCount = Math.max(0, deletedBlocksForDisplay.filter(block => !isAttachmentBlock(block.typeId)).length
        + data.attachments.documento.deletedCount + data.attachments.dataset.deletedCount + deletedAttachmentChanges);
    const hasChanges = changedBlocks.length > 0 || deletedBlocks.length > 0;
    const affectedBlockCount = modifiedBlockCount + deletedBlocks.length;
    const showActionsCard = deletedBlocks.length > 0 || affectedBlockCount > 1;
    const requiresMessage = affectedBlockCount > 1;
    const singleChangedBlockNumber = !showActionsCard && changedBlocks.length === 1 ? changedBlocks[0].blockNumber : null;
    const hasInvalidBlock = uploading.size > 0 || edit.blocks.some(block => !block.deleted && block.typeId === "visualizacion" && changeKind(block, savedByNumber) !== null && validVisualizations.get(block.blockNumber) !== block.content) || edit.blocks.some(block => !block.deleted && !(block.isNew && block.typeId === "parrafo" && blockIsEmpty(block)) && blockContentIsInvalid(block));
    const convergenceChanged = !saving && !deletingVersion && (conflict || !sameConvergence(edit.savedBlocks.filter(block => !isAttachmentBlock(block.typeId)), initialBlocks.filter(block => !isAttachmentBlock(block.typeId))));

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

    const confirmInlineBlock = (content: string) => {
        if (!inlinePopup) return;
        setEdit(current => {
            if (inlinePopup.blockNumber) return {...current, blocks: current.blocks.map(block => block.blockNumber === inlinePopup.blockNumber ? {...block,content} : block)};
            const visible = current.blocks.filter(block => !block.deleted && !isAttachmentBlock(block.typeId));
            const index = visible.findIndex(block => block.blockNumber === inlinePopup.after);
            const previous = visible[index], next = visible[index+1];
            const id = `new-${crypto.randomUUID()}`;
            const block: WorkingBlock = {id, blockNumber: id, typeId: inlinePopup.typeId, content, order: orderBetween(previous?.order ?? null,next?.order ?? null), commentCount: 0, isNew: true, deleted: false};
            const deactivated = deactivateBlock(current,null);
            const blocks = [...deactivated.blocks,block].sort(compareContentBlocks);
            return {...deactivated, blocks: normalizeTopicBlockOrders(blocks, current.savedBlocks, undefined, id)};
        });
        setInlinePopup(null);
        setError(null);
    };
    const removeInlineBlock = (blockNumber: string) => setEdit(current => ({
        ...current,
        blocks: current.blocks.flatMap(block => block.blockNumber !== blockNumber ? [block] : block.isNew ? [] : [{...block, deleted: true}]),
    }));
    const inlineActions = (block: WorkingBlock) => {
        const props = {
            disabled: saving,
            onEdit: () => setInlinePopup({typeId: block.typeId as "imagen" | "visualizacion" | "tabla", blockNumber: block.blockNumber, content: block.content}),
            onRemove: () => removeInlineBlock(block.blockNumber),
        };
        return <VisualizationEditActions {...props}/>;
    };

    const updateBlock = useCallback((updated: TopicBlock) => {
        setEdit(current => ({
            ...current,
            blocks: current.blocks.map(block => block.blockNumber === updated.blockNumber
                ? {...block, ...updated}
                : block),
        }));
        setError(null);
    }, []);

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
            return {...deactivated, blocks: normalizeTopicBlockOrders(blocks, current.savedBlocks, undefined, localNumber), activeBlockNumber: localNumber};
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
            return {...current, blocks: isAttachmentBlock(saved.typeId) ? blocks : normalizeTopicBlockOrders(blocks, current.savedBlocks, undefined, blockNumber), activeBlockNumber: blockNumber};
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
            const blocks = normalizeTopicBlockOrders(current.blocks, current.savedBlocks, reordered, moved.blockNumber);
            return {...current, blocks};
        });
    };

    const cancel = () => {
        setEdit(current => ({...stateFromSaved(current.savedBlocks), showDeleted: false, message: ""}));
        setError(null);
        setConflict(false);
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
            changes: topicEditChanges(state),
        };
        const result = await post<SaveTopicEditInput, SaveTopicEditOutput>(`/topics/${encodeURIComponent(topicId)}/edits`, input);
        if ("error" in result) {
            setSaving(false);
            setError(result.error);
            if (result.error.includes("convergencia")) {
                setConflict(true);
                void queryClient.invalidateQueries({queryKey: ["topic", topicId, "blocks"]});
            }
            return false;
        }
        const blocksKey = ["topic", topicId, "blocks"];
        // Prevent an older in-flight snapshot from replacing the saved convergence.
        await queryClient.cancelQueries({queryKey: blocksKey, exact: true});
        queryClient.setQueryData<TopicBlocksOutput>(blocksKey, result.value);
        for (const block of [...changed, ...deleted]) {
            if (!block.isNew) void queryClient.invalidateQueries({queryKey: topicBlockVersionsKey(topicId, block.blockNumber)});
        }
        const blocks = persistedBlocks(editableTopicBlocks(result.value));
        setConflict(false);
        setEdit({...stateFromSaved(blocks), showDeleted: false, message: ""});
        setSaving(false);
        toast({title: "Se guardó la edición"});
        void queryClient.invalidateQueries({queryKey: ["topic", topicId], refetchType: "all"});
        return true;
    };

    const refreshConvergence = async () => {
        setSaving(true);
        try {
            const latest = await get<TopicBlocksOutput>(`/topics/${encodeURIComponent(topicId)}/blocks`);
            if ('error' in latest) throw new Error(latest.error);
            const attachments = await Promise.all(edit.savedBlocks.filter(block => isAttachmentBlock(block.typeId)).map(async block => {
                const result = await get<{block: TopicEditableBlock}>(`/topics/${encodeURIComponent(topicId)}/blocks/${encodeURIComponent(block.blockNumber)}`);
                if ('error' in result) throw new Error(result.error);
                return result.value.block;
            }));
            const blocks = [...new Map([...editableTopicBlocks(latest.value), ...attachments].map(block => [block.blockNumber, block])).values()].sort(compareContentBlocks);
            queryClient.setQueryData(['topic', topicId, 'blocks'], latest.value);
            setEdit(current => mergeConvergence(current, blocks));
            setConflict(false);
            setError(null);
        } catch (error) { setError(error instanceof Error ? error.message : 'No pudimos actualizar la convergencia.'); }
        finally { setSaving(false); }
    };

    const visibleBlocks = edit.blocks.filter(block => !isAttachmentBlock(block.typeId) && (!block.deleted || (edit.showDeleted && !block.isNew)));
    const {footnotes, numberById} = useTopicFootnotes(edit.blocks);
    return <TopicFootnoteProvider topicId={topicId} blocks={edit.blocks} onSelectAttachment={block => setEdit(current => {
        if (current.blocks.some(item => item.blockNumber === block.blockNumber)) return current;
        return stageAttachment(current, block, block);
    })}><div className="flex flex-1 flex-col gap-3">
        {inlinePopup?.typeId === "visualizacion" && <VisualizationEditorPopup topicId={topicId} initialContent={inlinePopup.content} onClose={() => setInlinePopup(null)} onConfirm={confirmInlineBlock}/>}
        {inlinePopup?.typeId === "tabla" && <TableEditorPopup topicId={topicId} initialContent={inlinePopup.content} onClose={() => setInlinePopup(null)} onConfirm={confirmInlineBlock}/>}
        {inlinePopup?.typeId === "imagen" && <ImageEditorPopup initialContent={inlinePopup.content} onClose={() => setInlinePopup(null)} onConfirm={confirmInlineBlock}/>}
        {convergenceChanged && <TopicConvergenceNotice onUpdate={() => void refreshConvergence()}/>}
        <TopicDeletedBlocks topicId={topicId} count={deletedCount} open={edit.showDeleted}
            onToggle={() => setEdit(current => ({...current, showDeleted: !current.showDeleted}))}/>
        {edit.showDeleted && deletedCount === 0 && <p className="text-xs text-muted-foreground">No hay bloques eliminados.</p>}
        <TopicContentFlow className={cn("relative flex-1")}>
        {!saving && (visibleBlocks.length === 0 || !blockIsEmpty(visibleBlocks[0])) && <div className="absolute inset-x-0 top-0 z-10 -translate-y-1/2">
            <TopicBlockInsertButton onClick={() => startNewBlock(null)}/>
        </div>}
        {visibleBlocks.map((block, index) => {
            const kind = changeKind(block, savedByNumber);
            const active = edit.activeBlockNumber === block.blockNumber;
            const last = index === visibleBlocks.length - 1;
            const insertAfterImage = block.typeId === "imagen" && !last;
            const insertButton = !saving && !block.deleted && !blockIsEmpty(block) && (block.typeId === "imagen" || last || !blockIsEmpty(visibleBlocks[index + 1]))
                ? <TopicBlockInsertButton reserveSpace={block.typeId === "imagen"} className={cn(block.typeId === "imagen" && last && "clear-both")} onClick={() => startNewBlock(block.blockNumber)}/>
                : null;
            const changeIndicator = kind && <span className={cn("absolute -left-3 w-1 rounded-full", block.typeId === "imagen" ? "inset-y-0" : "top-2 bottom-2", changeBarClass(kind))} aria-hidden="true"/>;
            return <div key={block.blockNumber} className="contents">
                <TopicBlockFrame block={block}><div className={cn("group/block relative")}>
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
                        {block.typeId !== "imagen" && changeIndicator}
                        {block.deleted ? <TopicDeletedBlockItem block={block} topicId={topicId} openInPage={openToolsInPage}
                            newlyDeleted={!savedByNumber.get(block.blockNumber)?.deleted}
                            onRestore={() => restoreBlock(block.blockNumber)} toolsProps={blockSectionProps(block.blockNumber)}/>
                        : block.typeId === "imagen" ? <EditableImageBlock block={block} changeIndicator={changeIndicator} disabled={saving} onChange={updateBlock}
                            onEdit={() => setInlinePopup({typeId: "imagen", blockNumber: block.blockNumber, content: block.content})}
                            onRemove={() => removeInlineBlock(block.blockNumber)}
                            toolsProps={{topicId, hideDiscussion: block.isNew, openInPage: openToolsInPage, ...blockSectionProps(block.blockNumber)}}/>
                        : block.typeId === "visualizacion" ? <div className={cn("py-2")}>
                            <VisualizationBlock block={block} onValidityChange={valid => setValidVisualizations(current => {
                                if ((valid && current.get(block.blockNumber) === block.content) || (!valid && !current.has(block.blockNumber))) return current;
                                const next = new Map(current); if (valid) next.set(block.blockNumber,block.content); else next.delete(block.blockNumber); return next;
                            })}/>
                            <TopicBlockTools topicId={topicId} block={block} actions={inlineActions(block)} hideDiscussion={block.isNew} openInPage={openToolsInPage} {...blockSectionProps(block.blockNumber)}/>
                        </div>
                        : block.typeId === "tabla" ? <div className={cn("min-w-0 py-2")}><EditableTableBlock topicId={topicId} block={block} footnoteNumbers={numberById} disabled={saving || uploading.size > 0} onChange={updateBlock}/><TopicBlockTools topicId={topicId} block={block} actions={inlineActions(block)} hideDiscussion={block.isNew} openInPage={openToolsInPage} {...blockSectionProps(block.blockNumber)}/></div>
                        : active ? <TopicBlockEditForm topicId={topicId} block={block} isNew={block.isNew} blockTypes={blockTypes} footnoteNumbers={numberById} toolbarContainer={toolbarContainer}
                            documentInsertion={attachmentInsertion("documento")} datasetInsertion={attachmentInsertion("dataset")} onInsertVisualization={() => setInlinePopup({typeId: "visualizacion", after: block.blockNumber})} onInsertImage={() => setInlinePopup({typeId: "imagen", after: block.blockNumber})} onInsertTable={() => setInlinePopup({typeId: "tabla", after: block.blockNumber})} onChange={updateBlock} onDeleteEmpty={() => removeEmptyBlock(block.blockNumber)}/>
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
                    {((active && block.typeId === "parrafo") || (singleChangedBlockNumber === block.blockNumber && (active || kind === "order" || block.typeId === "visualizacion" || block.typeId === "imagen" || block.typeId === "tabla"))) && <div
                        className="flex items-start justify-between gap-2 pt-2 pb-2" draggable={false}
                        data-topic-editor-block={block.blockNumber}
                        onDragStart={event => event.stopPropagation()}>
                        <div ref={active && block.typeId === "parrafo" ? setToolbarContainer : undefined} className="min-w-0"/>
                        {singleChangedBlockNumber === block.blockNumber && <div
                            className={cn("flex flex-col items-end gap-2", shaking && "animate-[block-shake_180ms_ease-in-out]")}
                            onAnimationEnd={() => setShaking(false)}>
                            {error && <p className="text-xs text-destructive">{error}</p>}
                            <TopicEditActionButtons saving={saving || uploading.size > 0} saveDisabled={hasInvalidBlock} onCancel={cancel} onSave={() => void save()}/>
                        </div>}
                    </div>}
                    {!block.isNew && !block.deleted && block.typeId !== "visualizacion" && block.typeId !== "imagen" && block.typeId !== "tabla" && <TopicBlockTools
                        topicId={topicId}
                        block={block}
                        openInPage={openToolsInPage}
                        {...blockSectionProps(block.blockNumber)}
                    />}
                </div>
                    {insertAfterImage && insertButton}
                </TopicBlockFrame>
                {!insertAfterImage && insertButton}
            </div>;
        })}
        <div className={cn("clear-both")}><TopicFootnoteList footnotes={footnotes}/></div>
        {(["documento", "dataset"] as const).map(type => <TopicDocumentEditor key={type} dataset={type === "dataset"} topicId={topicId} summary={data.attachments[type]} includeDeleted={edit.showDeleted}
            blocks={edit.blocks.filter(block => block.typeId === type && (changeKind(block, savedByNumber) !== null || (block.deleted && !savedByNumber.get(block.blockNumber)?.deleted)))}
            insertionAction={attachmentInsertion(type)} disabled={saving || uploading.size > 0} onChange={(block, original) => setEdit(current => stageAttachment(current, original, {...original, ...block}))}
            onRestore={block => setEdit(current => stageAttachment(current, block, {...block, deleted: false}))}
            renderActions={(blockNumber, onClose) => (!hasChanges || singleChangedBlockNumber === blockNumber) && <div className={cn("flex flex-col items-end gap-2", shaking && "animate-[block-shake_180ms_ease-in-out]")}
                onAnimationEnd={() => setShaking(false)}>
                {error && <p role="alert" className={cn("text-xs text-destructive")}>{error}</p>}
                <TopicEditActionButtons saving={saving || uploading.size > 0} saveDisabled={!hasChanges || hasInvalidBlock} onCancel={() => { cancel(); onClose(); }} onSave={() => { void save().then(saved => { if (saved) onClose(); }); }}/>
            </div>}
            onBusyChange={(blockNumber, busy) => setUploading(current => {
                const next = new Set(current); if (busy) next.add(blockNumber); else next.delete(blockNumber); return next;
            })}
            onRemove={block => setEdit(current => block.isNew
                ? {...current, blocks: current.blocks.filter(item => item.blockNumber !== block.blockNumber)}
                : stageAttachment(current, block, {...block, deleted: true}))}/>) }
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
        </TopicContentFlow>
    </div></TopicFootnoteProvider>;
});
