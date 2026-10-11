import {XIcon} from '@phosphor-icons/react';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';

export function TopicEditingBadge({onExit}: {onExit: () => void}) {
    return <div className={cn('fixed top-6 left-1/2 z-40 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 py-0.5 pr-1 pl-2.5 text-xs font-medium text-amber-700 shadow-sm dark:text-amber-300')}>
        <span>Modo edición</span>
        <Button type="button" variant="ghost" size="icon-xs"
            className={cn('rounded-full text-current hover:bg-amber-500/15 hover:text-current dark:hover:bg-amber-300/15')}
            onClick={onExit} aria-label="Salir del modo edición" title="Salir del modo edición">
            <XIcon weight="bold"/>
        </Button>
    </div>;
}
