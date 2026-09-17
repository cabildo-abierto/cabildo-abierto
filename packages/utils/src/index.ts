const FIRST = "a".charCodeAt(0);
const MIDDLE = "n";
const ORDER_ALPHABET = "bcdefghijklmnopqrstuvwxy";

export type BlockPermutationEntry = {blockNumber: string; order: string};

export function isOrder(value: unknown): value is string {
    return typeof value === "string" && /^[a-z]+$/.test(value) && !value.endsWith("a");
}

export function orderBetween(lower: string | null, upper: string | null): string {
    if (lower !== null && !isOrder(lower)) throw new Error("Invalid lower order");
    if (upper !== null && !isOrder(upper)) throw new Error("Invalid upper order");
    if (lower !== null && upper !== null && lower >= upper) throw new Error("Orders are not increasing");
    if (lower === null && upper === null) return MIDDLE;
    if (upper === null) return `${lower}${MIDDLE}`;

    const left = lower ?? "";
    let commonLength = 0;
    while (commonLength < left.length && left[commonLength] === upper[commonLength]) commonLength += 1;
    const prefix = left.slice(0, commonLength);
    const leftRest = left.slice(commonLength);
    const upperRest = upper.slice(commonLength);

    if (leftRest.length === 0) {
        const upperDigit = upperRest.charCodeAt(0) - FIRST;
        if (upperDigit > 1) return prefix + String.fromCharCode(FIRST + Math.floor(upperDigit / 2));
        return prefix + "a" + orderBetween(null, upperRest.slice(1) || null);
    }

    const leftDigit = leftRest.charCodeAt(0) - FIRST;
    const upperDigit = upperRest.charCodeAt(0) - FIRST;
    if (upperDigit - leftDigit > 1) {
        return prefix + String.fromCharCode(FIRST + Math.floor((leftDigit + upperDigit) / 2));
    }
    return prefix + leftRest[0] + orderBetween(leftRest.slice(1) || null, null);
}

export function evenlySpacedOrder(index: number): string {
    let value = index;
    let suffix = "";
    for (let position = 0; position < 6; position += 1) {
        suffix = ORDER_ALPHABET[value % ORDER_ALPHABET.length] + suffix;
        value = Math.floor(value / ORDER_ALPHABET.length);
    }
    if (value > 0) throw new Error("Too many blocks to order");
    return `m${suffix}`;
}

export function permutationFor(blockNumbers: string[]): BlockPermutationEntry[] {
    return blockNumbers.map((blockNumber, index) => ({blockNumber, order: evenlySpacedOrder(index)}));
}

export * from "./rich-text.js";

export * from "./topic-slug.js";
