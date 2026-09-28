import Link from "next/link";
import {ChatCircleIcon, FileTextIcon, TableIcon} from '@phosphor-icons/react';
import type {ContentSearchResult, TopicSummary} from "@cabildo-abierto/api";
import {Card, CardContent} from "@/components/ui/card";
import {SearchSnippet} from '@/components/search/search-snippet';
import {cn} from '@/lib/utils';
import {topicAuthorName} from '@/components/topic-author-name';
import {formatRelativeDate, formatTopicBlockDate} from '@/components/topic-block-date';

type TopicSearchResultProps = {topic: TopicSummary} | {result: ContentSearchResult};

export function TopicSearchResult(props: TopicSearchResultProps) {
    const result = 'result' in props ? props.result : null;
    const topic = 'topic' in props ? props.topic : props.result.topic;
    const ResultIcon = result?.kind === 'comment' ? ChatCircleIcon : result?.blockType === 'dataset' ? TableIcon : FileTextIcon;
    const resultType = result?.kind === 'comment' ? 'Comentario' : result?.blockType === 'dataset' ? 'Conjunto de datos' : 'Documento';
    return <Link href={`/tema/${encodeURIComponent(topic.slug)}`} className={cn("block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring")}>
        <Card className={cn("py-0 transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-muted/50 hover:shadow-sm active:translate-y-0 motion-reduce:transition-none")}>
            <CardContent className={cn("flex flex-col gap-2 px-4 py-4")}>
                <span className={cn("font-medium")}>{topic.title}</span>
                {result && result.kind !== 'topic_title' && <>
                    {(result.attachmentTitle || result.kind === 'comment') && <span className={cn('flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground')}>
                        <ResultIcon className={cn('size-3.5 shrink-0')} role="img" aria-label={resultType}/>
                        {result.kind === 'comment' && <span>Comentario</span>}
                        {result.attachmentTitle && <span>{result.attachmentTitle}</span>}
                    </span>}
                    {result.kind === 'comment' && result.comment && <span className={cn('flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground')}>
                        <span className={cn('font-medium')}>{topicAuthorName(result.comment.author)}</span>
                        <time dateTime={result.comment.createdAt} title={formatTopicBlockDate(result.comment.createdAt)}>{formatRelativeDate(result.comment.createdAt)}</time>
                    </span>}
                    <SearchSnippet snippet={result.snippet}/>
                    {result.historical && <span className={cn('text-xs text-muted-foreground')}>Versión anterior</span>}
                </>}
            </CardContent>
        </Card>
    </Link>;
}
