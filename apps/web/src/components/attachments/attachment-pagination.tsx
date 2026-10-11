import {PageControls} from '@/components/ui/page-controls';
import {cn} from '@/lib/utils';

export function AttachmentPagination({total, page, pageSize, label, disabled, onPageChange}: {
    total: number; page: number; pageSize: number; label: string; disabled: boolean; onPageChange: (page: number) => void;
}) {
    const pages = Math.max(1, Math.ceil(total / pageSize));
    return <div className={cn('flex items-center justify-end gap-2')}>
        <span role="status" className={cn('mr-auto text-xs text-muted-foreground')}>{total} {label}</span>
        <PageControls page={page} pages={pages} loading={disabled} onPageChange={onPageChange}/>
    </div>;
}
