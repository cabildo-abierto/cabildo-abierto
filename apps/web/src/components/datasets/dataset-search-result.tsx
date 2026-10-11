import {DatasetDimensions} from './dataset-dimensions';
import {cn} from '@/lib/utils';

export function DatasetSearchResult({title, rowCount, columnCount, topicTitle}: {
    title: string; rowCount?: number; columnCount: number; topicTitle?: string;
}) {
    return <span className={cn('min-w-0 flex-1')}>
        <span title={title} className={cn('block line-clamp-2 whitespace-normal wrap-break-word font-medium')}>{title}</span>
        <span className={cn('mt-1 flex min-w-0 items-center gap-1 text-muted-foreground')}>
            <span className={cn('shrink-0')}><DatasetDimensions rowCount={rowCount} columnCount={columnCount}/></span>
            {topicTitle && <><span aria-hidden="true">·</span><span title={topicTitle} className={cn('truncate')}>{topicTitle}</span></>}
        </span>
    </span>;
}
