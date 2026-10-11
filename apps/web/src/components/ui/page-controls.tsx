import {CaretLeftIcon, CaretRightIcon} from '@phosphor-icons/react';
import {Button} from './button';
import {cn} from '@/lib/utils';

export function PageControls({page, pages, loading = false, onPageChange}: {
    page: number; pages: number; loading?: boolean; onPageChange: (page: number) => void;
}) {
    return <div className={cn('flex items-center gap-2')}>
        <span className={cn('text-xs text-muted-foreground')}>{page + 1} / {pages}</span>
        <div className={cn('flex items-center gap-1')}>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Página anterior" title="Página anterior"
                disabled={loading || page === 0} onClick={() => onPageChange(page - 1)}><CaretLeftIcon/></Button>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Página siguiente" title="Página siguiente"
                disabled={loading || page + 1 >= pages} onClick={() => onPageChange(page + 1)}><CaretRightIcon/></Button>
        </div>
    </div>;
}
