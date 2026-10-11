import {ArrowUpRightIcon} from '@phosphor-icons/react';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';

export function DocumentSourceLink({url}: {url: string}) {
    return <div className={cn('flex shrink-0 items-center gap-1 text-xs text-muted-foreground')}>
        <span className={cn('break-all')}>Fuente: {new URL(url).hostname}</span>
        <Button nativeButton={false} render={<a href={url} target="_blank" rel="noopener noreferrer"/>} variant="ghost" size="icon-xs" aria-label="Abrir en la fuente" title="Abrir en la fuente">
            <ArrowUpRightIcon/>
        </Button>
    </div>;
}
