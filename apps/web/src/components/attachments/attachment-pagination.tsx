import {CaretLeftIcon, CaretRightIcon} from '@phosphor-icons/react';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';

export function AttachmentPagination({total, page, pageSize, label, disabled, onPageChange}: {
    total: number; page: number; pageSize: number; label: string; disabled: boolean; onPageChange: (page: number) => void;
}) {
    const pages = Math.max(1, Math.ceil(total / pageSize));
    return <div className={cn('flex items-center justify-end gap-2')}>
        <span role="status" className={cn('mr-auto text-xs text-muted-foreground')}>{total} {label}</span>
        <span className={cn('text-xs text-muted-foreground')}>{page + 1} / {pages}</span>
        <div className={cn('flex items-center gap-1')}>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Página anterior" title="Página anterior"
                disabled={disabled || page === 0} onClick={() => onPageChange(page - 1)}><CaretLeftIcon/></Button>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Página siguiente" title="Página siguiente"
                disabled={disabled || page + 1 >= pages} onClick={() => onPageChange(page + 1)}><CaretRightIcon/></Button>
        </div>
    </div>;
}
