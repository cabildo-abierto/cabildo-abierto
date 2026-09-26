import {lccaReservedWord, nextLccaToken, tokenizeLcca} from '@cabildo-abierto/utils';
import {cn} from '@/lib/utils';

export function LccaSyntax({query}: {query: string}) {
    const tokens = tokenizeLcca(query);
    return <>{tokens.map((token, index) => {
        const reserved = token.kind === 'word' && lccaReservedWord(token.text);
        const color = token.kind === 'comment' ? 'text-muted-foreground'
            : token.kind === 'string' ? 'text-emerald-700 dark:text-emerald-400'
            : token.kind === 'identifier' ? 'text-foreground'
            : reserved ? 'text-blue-700 dark:text-blue-400'
            : token.kind === 'number' ? 'text-amber-700 dark:text-amber-400'
            : token.kind === 'word' && nextLccaToken(tokens, index)?.text === '(' ? 'text-violet-700 dark:text-violet-400' : '';
        return <span key={token.start} className={cn(color)}>{token.text}</span>;
    })}</>;
}
