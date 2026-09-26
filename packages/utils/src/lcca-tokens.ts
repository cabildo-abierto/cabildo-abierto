export type LccaToken = {kind: 'word' | 'number' | 'string' | 'identifier' | 'comment' | 'plain'; text: string; start: number; end: number};

export function nextLccaToken(tokens: LccaToken[], index: number): LccaToken | undefined {
    let next = index + 1;
    while (next < tokens.length && (tokens[next].kind === 'comment' || (tokens[next].kind === 'plain' && /^\s+$/.test(tokens[next].text)))) next++;
    return tokens[next];
}

function quotedEnd(query: string, start: number, quote: string, escaped: boolean): number {
    let index = start + 1;
    while (index < query.length) {
        if (escaped && query[index] === '\\') { index += 2; continue; }
        if (query[index] === quote) {
            if (query[index + 1] !== quote) return index + 1;
            index += 2;
        } else index++;
    }
    return query.length;
}

export function tokenizeLcca(query: string): LccaToken[] {
    const tokens: LccaToken[] = [];
    let index = 0;
    while (index < query.length) {
        const start = index;
        const rest = query.slice(index);
        let kind: LccaToken['kind'] = 'plain';
        if (rest.startsWith('--')) {
            kind = 'comment';
            const end = query.indexOf('\n', index);
            index = end < 0 ? query.length : end;
        } else if (rest.startsWith('/*')) {
            kind = 'comment'; index += 2;
            let depth = 1;
            while (index < query.length && depth) {
                if (query.startsWith('/*', index)) { depth++; index += 2; }
                else if (query.startsWith('*/', index)) { depth--; index += 2; }
                else index++;
            }
        } else if (rest[0] === "'" || rest[0] === '"' || /^[eE]'/.test(rest)) {
            const escaped = /^[eE]'/.test(rest);
            const quoteStart = index + (escaped ? 1 : 0);
            kind = query[quoteStart] === '"' ? 'identifier' : 'string';
            index = quotedEnd(query, quoteStart, query[quoteStart], escaped);
        } else {
            const dollar = rest.match(/^\$(?:[\p{L}_][\p{L}\p{N}_]*)?\$/u)?.[0];
            if (dollar) {
                kind = 'string';
                const end = query.indexOf(dollar, index + dollar.length);
                index = end < 0 ? query.length : end + dollar.length;
            } else {
                const number = rest.match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/)?.[0];
                const word = number ? undefined : rest.match(/^[\p{L}_][\p{L}\p{N}\p{M}_$]*/u)?.[0];
                kind = number ? 'number' : word ? 'word' : 'plain';
                index += (number ?? word ?? rest.match(/^\s+/)?.[0] ?? String.fromCodePoint(query.codePointAt(index)!)).length;
            }
        }
        tokens.push({kind, text: query.slice(start, index), start, end: index});
    }
    return tokens;
}
