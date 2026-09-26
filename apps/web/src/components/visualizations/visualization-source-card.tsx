import Link from 'next/link';
import type {VisualizationSourcesOutput} from '@cabildo-abierto/api';
import {parseDatasetBlock} from '@cabildo-abierto/utils';
import {DocumentLink} from '@/components/documents/document-link';
import {useTopicRoute} from '@/components/topic-route-provider';
import {cn} from '@/lib/utils';

export function VisualizationSourceCard({source}: {source: VisualizationSourcesOutput['sources'][number]}) {
    const currentTopic = useTopicRoute();
    const data = parseDatasetBlock(source.block.content);
    const title = data?.title ?? 'Conjunto de datos';
    return <div className={cn('min-w-0 rounded-md')}>
        <DocumentLink topicId={source.topic.id} block={source.block} title={title}
            className={cn('block min-w-0 space-y-1 rounded-md px-2 py-2 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30')}>
            <span className={cn('block truncate text-xs font-medium')} title={title}>{title}</span>
            {data?.description.trim() && <span className={cn('block whitespace-pre-wrap text-xs text-muted-foreground wrap-anywhere')}>{data.description}</span>}
        </DocumentLink>
        {source.topic.id !== currentTopic.id && <p className={cn('px-2 pb-2 text-[10px] text-muted-foreground wrap-anywhere')}>
            En tema <Link href={`/tema/${encodeURIComponent(source.topic.slug)}`} className={cn('underline underline-offset-2 hover:text-foreground')}>{source.topic.title}</Link>
        </p>}
    </div>;
}
