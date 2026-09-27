import type {TopicBlock} from "@cabildo-abierto/api";
import {compareContentBlocks, isAttachmentBlock, minimumBlockOrders} from "@cabildo-abierto/utils";

export function normalizeTopicBlockOrders<T extends TopicBlock & {deleted: boolean}>(
    blocks: T[],
    savedBlocks: readonly T[],
    desired = blocks.filter(block => !block.deleted && !isAttachmentBlock(block.typeId)),
    affectedBlockNumber?: string,
): T[] {
    const original = savedBlocks.filter(block => !isAttachmentBlock(block.typeId));
    const ordered = minimumBlockOrders(desired, original, affectedBlockNumber);
    const byNumber = new Map(ordered.map(block => [block.blockNumber, block]));
    return blocks.map(block => byNumber.get(block.blockNumber) ?? block).sort(compareContentBlocks);
}
