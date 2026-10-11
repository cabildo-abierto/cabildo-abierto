import type {DatasetReference} from '@cabildo-abierto/api';
import {lccaReservedWord, tokenizeLcca, validDatasetBlockNumber, type LccaToken} from '@cabildo-abierto/utils';

export type LccaDatasetReference = DatasetReference & {start: number; end: number};

function stringLiteral(token: LccaToken): string | null {
    if (token.kind !== 'string') return null;
    if (/^'(?:[^']|'')*'$/.test(token.text)) return token.text.slice(1, -1).replaceAll("''", "'");
    const delimiter = token.text.match(/^\$(?:[\p{L}_][\p{L}\p{N}_]*)?\$/u)?.[0];
    if (delimiter && token.text.length >= delimiter.length * 2 && token.text.endsWith(delimiter)) {
        return token.text.slice(delimiter.length, -delimiter.length);
    }
    if (/^[eE]'(?:[^'\\]|''|\\[\s\S])*'$/.test(token.text)) {
        const value = token.text.slice(2, -1).replaceAll("''", "'");
        // Do not guess the meaning of uncommon SQL escape sequences.
        if (/\\[^\\'"nrtbf]/.test(value)) return null;
        const escapes: Record<string, string> = {n: '\n', r: '\r', t: '\t', b: '\b', f: '\f'};
        return value.replace(/\\([\\'"nrtbf])/g, (_, character: string) => escapes[character] ?? character);
    }
    return null;
}

export function lccaDatasetReferences(query: string): LccaDatasetReference[] {
    const tokens = tokenizeLcca(query).filter(token => token.kind !== 'comment' && !/^\s+$/.test(token.text));
    const references: LccaDatasetReference[] = [];
    for (let index = 0; index + 5 < tokens.length; index++) {
        const [name, open, topic, comma, block, close] = tokens.slice(index, index + 6);
        if (name.kind !== 'word' || tokens[index - 1]?.text === '.'
            || (lccaReservedWord(name.text)?.sql !== 'dataset' && name.text.toLowerCase() !== 'dataset')
            || open.text !== '(' || comma.text !== ',' || close.text !== ')') continue;
        const topicId = stringLiteral(topic);
        const blockNumber = stringLiteral(block);
        if (!topicId || topicId.length > 1000 || !blockNumber || !validDatasetBlockNumber(blockNumber)) continue;
        references.push({topicId, blockNumber, start: name.start, end: close.end});
    }
    return references;
}
