import type {TopicBlock} from "@cabildo-abierto/api";

export function sameConvergence(left: TopicBlock[], right: TopicBlock[]): boolean {
    if (left.length !== right.length) return false;
    return left.every((block, index) => block.blockNumber === right[index].blockNumber && block.id === right[index].id);
}

export function updateCommentCounts<T extends TopicBlock>(displayed: T[], latest: TopicBlock[]): T[] {
    const countsByNumber = new Map(latest.map(block => [block.blockNumber, block.commentCount]));
    return displayed.map(block => {
        const commentCount = countsByNumber.get(block.blockNumber);
        return commentCount === undefined || commentCount === block.commentCount ? block : {...block, commentCount};
    });
}
