import {isOrder, orderBetween, type BlockPermutationEntry} from "./index.js";

type Subsequence = {
    index: number;
    length: number;
    unchanged: number;
    unaffected: number;
    previous: Subsequence | null;
};

function preferred(left: Subsequence | null, right: Subsequence | null): Subsequence | null {
    if (!left) return right;
    if (!right) return left;
    for (const key of ["length", "unchanged", "unaffected"] as const) {
        if (left[key] !== right[key]) return left[key] > right[key] ? left : right;
    }
    return left.index <= right.index ? left : right;
}

export function minimumBlockOrders<T extends BlockPermutationEntry>(
    desired: readonly T[],
    original: readonly BlockPermutationEntry[],
    affectedBlockNumber?: string,
): T[] {
    const originalByNumber = new Map(original.map(block => [block.blockNumber, block.order]));
    const orders = [...new Set(desired.flatMap(block => {
        const order = originalByNumber.get(block.blockNumber);
        return order === undefined ? [] : [order];
    }))].sort();
    const ranks = new Map(orders.map((order, index) => [order, index + 1]));
    const tree: (Subsequence | null)[] = Array(orders.length + 1).fill(null);
    const query = (rank: number) => {
        let best: Subsequence | null = null;
        for (let i = rank; i > 0; i -= i & -i) best = preferred(best, tree[i]);
        return best;
    };

    // A maximum increasing subsequence keeps the most original orders possible.
    desired.forEach((block, index) => {
        const originalOrder = originalByNumber.get(block.blockNumber);
        if (originalOrder === undefined) return;
        const rank = ranks.get(originalOrder)!;
        const previous = query(rank - 1);
        const current: Subsequence = {
            index,
            length: (previous?.length ?? 0) + 1,
            unchanged: (previous?.unchanged ?? 0) + Number(block.order === originalOrder),
            unaffected: (previous?.unaffected ?? 0) + Number(block.blockNumber !== affectedBlockNumber),
            previous,
        };
        for (let i = rank; i < tree.length; i += i & -i) tree[i] = preferred(tree[i], current);
    });

    const anchors: number[] = [];
    for (let best = query(orders.length); best; best = best.previous) anchors.push(best.index);
    anchors.reverse();
    const result = [...desired];
    let cursor = 0;
    let lower: string | null = null;
    for (const anchor of [...anchors, desired.length]) {
        const upper = anchor < desired.length ? originalByNumber.get(desired[anchor].blockNumber)! : null;
        for (let index = cursor; index < anchor; index++) {
            const block = desired[index];
            const fits: boolean = isOrder(block.order) && (lower === null || block.order > lower) && (upper === null || block.order < upper);
            const order: string = fits ? block.order : orderBetween(lower, upper);
            if (order !== block.order) result[index] = {...block, order};
            lower = order;
        }
        if (anchor < desired.length) {
            const block = desired[anchor];
            if (block.order !== upper) result[anchor] = {...block, order: upper!};
            lower = upper;
        }
        cursor = anchor + 1;
    }
    return result;
}
