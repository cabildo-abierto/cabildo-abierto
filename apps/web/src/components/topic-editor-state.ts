import type {TopicBlock, TopicBlockChange, TopicBlocksOutput, TopicEditableBlock} from '@cabildo-abierto/api';
import {compareContentBlocks, isAttachmentBlock} from '@cabildo-abierto/utils';
import {blockIsEmpty} from './topic-block-content-validation';
import {normalizeTopicBlockOrders} from './topic-block-order';

export type WorkingBlock = TopicBlock & {isNew: boolean; deleted: boolean};
export type TopicEditState = {
    savedBlocks: WorkingBlock[]
    blocks: WorkingBlock[]
    activeBlockNumber: string | null
    showDeleted: boolean
    message: string
};
export type ChangeKind = "new" | "content" | "order" | null;

export function newAttachmentBlock(typeId: "documento" | "dataset", id: string, content: string): WorkingBlock {
    return {id, blockNumber: id, typeId, content, order: "n", commentCount: 0, isNew: true, deleted: false};
}

export function persistedBlocks(blocks: TopicEditableBlock[]): WorkingBlock[] {
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

export function stateFromSaved(savedBlocks: WorkingBlock[], activeBlockNumber: string | null = null): Pick<TopicEditState, "savedBlocks" | "blocks" | "activeBlockNumber"> {
    const blocks = [...savedBlocks];
    if (blocks.some(block => !block.deleted)) return {savedBlocks, blocks, activeBlockNumber};
    const paragraph = emptyParagraph();
    return {savedBlocks, blocks: [...blocks, paragraph], activeBlockNumber: paragraph.blockNumber};
}

export function changeKind(block: WorkingBlock, savedByNumber: ReadonlyMap<string, WorkingBlock>): ChangeKind {
    if (block.isNew) return blockIsEmpty(block) ? null : "new";
    const saved = savedByNumber.get(block.blockNumber);
    if (!saved) return null;
    if (block.deleted) return null;
    if (saved.deleted !== block.deleted) return "content";
    if (block.content !== saved.content) return "content";
    if (!isAttachmentBlock(block.typeId) && block.order !== saved.order) return "order";
    return null;
}

export function mergeConvergence(state: TopicEditState, latestBlocks: TopicEditableBlock[]): TopicEditState {
    const latestNumbers = new Set(latestBlocks.map(block => block.blockNumber));
    latestBlocks = [...latestBlocks, ...state.savedBlocks.filter(block => isAttachmentBlock(block.typeId) && !latestNumbers.has(block.blockNumber))].sort(compareContentBlocks);
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
    const savedBlocks = persistedBlocks(latestBlocks);
    const hasLocalOrderChanges = state.blocks.some(block => !block.isNew && !block.deleted && !isAttachmentBlock(block.typeId)
        && block.order !== previousSavedByNumber.get(block.blockNumber)?.order);
    if (hasDuplicateOrder || hasLocalOrderChanges) blocks = normalizeTopicBlockOrders(blocks, savedBlocks);
    const activeBlockNumber = blocks.some(block => !block.deleted && block.blockNumber === state.activeBlockNumber)
        ? state.activeBlockNumber
        : null;
    if (blocks.some(block => !block.deleted)) return {...state, savedBlocks, blocks, activeBlockNumber};
    const paragraph = emptyParagraph();
    return {...state, savedBlocks, blocks: [...blocks, paragraph], activeBlockNumber: paragraph.blockNumber};
}

export function deactivateBlock(state: TopicEditState, nextActiveBlockNumber: string | null): TopicEditState {
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


export function editableTopicBlocks(data: TopicBlocksOutput): TopicEditableBlock[] {
    return [...new Map([...data.blocks, ...data.deletedBlocks, ...data.footnoteAttachments].map(block => [block.blockNumber, block])).values()].sort(compareContentBlocks);
}

export function stageAttachment(state: TopicEditState, original: TopicEditableBlock, updated: TopicEditableBlock): TopicEditState {
    if (original.blockNumber.startsWith('new-')) return {...state, blocks: state.blocks.map(block => block.blockNumber === original.blockNumber ? {...block, ...updated} : block)};
    const saved = state.savedBlocks.find(block => block.blockNumber === original.blockNumber);
    const working = state.blocks.find(block => block.blockNumber === original.blockNumber);
    const dirty = saved && working && (saved.content !== working.content || saved.deleted !== working.deleted);
    const baseline = dirty ? saved : {...original, isNew: false};
    return {...state,
        savedBlocks: [...state.savedBlocks.filter(block => block.blockNumber !== original.blockNumber), baseline],
        blocks: [...state.blocks.filter(block => block.blockNumber !== original.blockNumber), {...original, ...updated, isNew: false}].sort(compareContentBlocks),
    };
}

export function topicEditChanges(state: TopicEditState): TopicBlockChange[] {
    const saved = new Map(state.savedBlocks.map(block => [block.blockNumber, block]));
    return state.blocks.flatMap((block): TopicBlockChange[] => {
        if (block.isNew) return block.deleted || blockIsEmpty(block) ? [] : [{action: 'create', localId: block.blockNumber, typeId: block.typeId, content: block.content, order: block.order}];
        const original = saved.get(block.blockNumber);
        if (!original) return [];
        if (block.deleted) return original.deleted ? [] : [{action: 'delete', blockNumber: block.blockNumber, baseVersionId: original.id}];
        return changeKind(block, saved) === null ? [] : [{action: 'update', blockNumber: block.blockNumber, baseVersionId: original.id,
            typeId: block.typeId, content: block.content, order: block.order, deleted: false}];
    });
}
