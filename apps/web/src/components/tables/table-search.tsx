import {MagnifyingGlassIcon} from '@phosphor-icons/react';
import {Input} from '@/components/ui/input';
import {cn} from '@/lib/utils';

export function TableSearch({value, onChange}: {value: string; onChange: (value: string) => void}) {
    return <div className={cn('flex w-36 min-w-0 items-center gap-1 rounded-md border bg-input/20 px-2')}>
        <MagnifyingGlassIcon className={cn('size-3 shrink-0 text-muted-foreground')}/>
        <Input aria-label="Buscar en la tabla" placeholder="Buscar..." value={value} maxLength={500}
            className={cn('h-6 border-0 bg-transparent px-0 text-xs focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent')}
            onChange={event => onChange(event.target.value)}/>
    </div>;
}
