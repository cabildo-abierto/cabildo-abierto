"use client";

import {useState, type ReactNode} from "react";
import type {TopicEditableBlock, TopicAttachmentSummary, TopicAttachmentsOutput} from "@cabildo-abierto/api";
import {keepPreviousData, useQuery} from "@tanstack/react-query";
import {dataViewRequest} from "@/utils/react/data-view-request";
import {useDebouncedValue} from "@/hooks/use-debounced-value";
import {Spinner} from "@/components/ui/spinner";
import {AttachmentSearch} from "./attachment-search";
import {AttachmentPagination} from "./attachment-pagination";
import {DocumentSection} from "@/components/documents/document-section";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

const PAGE_SIZE = 12;

export function TopicAttachmentSection({topicId, summary, includeDeleted, renderBlock, dataset = false}: {
    dataset?: boolean; topicId: string; summary: TopicAttachmentSummary; includeDeleted: boolean;
    renderBlock: (block: TopicEditableBlock) => ReactNode;
}) {
    const [expanded, setExpanded] = useState(false);
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(0);
    const label = dataset ? "conjuntos de datos" : "documentos";
    const debouncedQuery = useDebouncedValue(query, 250);
    const paginated = summary.count + (includeDeleted ? summary.deletedCount : 0) > PAGE_SIZE;
    const type = dataset ? 'dataset' : 'documento';
    const result = useQuery({
        queryKey: ['topic', topicId, 'blocks', 'attachments', type, debouncedQuery, page, includeDeleted, summary.revision],
        enabled: expanded && query === debouncedQuery,
        placeholderData: keepPreviousData,
        queryFn: ({signal}) => {
            const params = new URLSearchParams({type, search: debouncedQuery, page: String(page), includeDeleted: String(includeDeleted)});
            return dataViewRequest<TopicAttachmentsOutput>(`/topics/${encodeURIComponent(topicId)}/attachments?${params}`, {signal});
        },
    });
    const loading = result.isPending || result.isPlaceholderData || query !== debouncedQuery;
    const currentPage = result.data?.page ?? page;

    return <DocumentSection dataset={dataset} onExpandedChange={setExpanded} endActions={<AttachmentSearch dataset={dataset} available={paginated} value={query}
        onChange={value => {setQuery(value); setPage(0);}}/>}
        after={paginated && result.data && <div className={cn('mt-3')}>
            <AttachmentPagination total={result.data.total} page={currentPage} pageSize={result.data.pageSize}
                label={label} disabled={loading || result.isError} onPageChange={setPage}/>
        </div>}>

        {loading ? <div role="status" aria-label={`Cargando ${label}`} className={cn('col-span-full flex justify-center py-6')}><Spinner/></div>
            : result.isError ? <div className={cn('col-span-full space-y-2')}>
                <p role="alert" className={cn('text-xs text-destructive')}>{result.error.message}</p>
                <Button type="button" variant="outline" size="sm" onClick={() => void result.refetch()}>Reintentar</Button>
            </div> : result.data?.blocks.map(renderBlock)}
        {!loading && !result.isError && result.data?.total === 0 && <p className={cn("col-span-full py-2 text-sm text-muted-foreground")}>No encontramos {label} para esa búsqueda.</p>}
    </DocumentSection>;
}
