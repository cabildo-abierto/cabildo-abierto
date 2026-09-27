import {Fragment} from 'react';
import type {SearchSnippet as Snippet} from '@cabildo-abierto/api';
import {cn} from '@/lib/utils';

export function SearchSnippet({snippet}: {snippet: Snippet}) {
    let offset = 0;
    const parts = snippet.highlights.map(({start, end}, index) => {
        const before = snippet.text.slice(offset, start);
        offset = end;
        return <Fragment key={index}>{before}<strong className={cn('font-bold')}>{snippet.text.slice(start, end)}</strong></Fragment>;
    });
    return <p className={cn('break-words text-sm text-muted-foreground')}>{parts}{snippet.text.slice(offset)}</p>;
}
