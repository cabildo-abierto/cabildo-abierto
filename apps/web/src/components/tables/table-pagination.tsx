import {PageControls} from '@/components/ui/page-controls';
import {DatasetDimensions} from '@/components/datasets/dataset-dimensions';
import {cn} from '@/lib/utils';

export function TablePagination({page, pageSize, rowCount, columnCount, loading = false, onPageChange, children}: {
    page: number; pageSize: number; rowCount: number; columnCount: number; loading?: boolean; onPageChange: (page: number) => void;
    children?: ReactNode;
}) {
    const pages = Math.max(1, Math.ceil(rowCount / pageSize));
    return <div className={cn('flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground')}>
        <DatasetDimensions rowCount={rowCount} columnCount={columnCount}/>
        <div className={cn('ml-auto flex min-w-0 items-center gap-2')}>
            {children}
            {pages > 1 && <PageControls page={page} pages={pages} loading={loading} onPageChange={onPageChange}/>}
        </div>
    </div>;
}
import type {ReactNode} from 'react';
