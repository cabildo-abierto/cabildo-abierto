"use client";

import {useState, type ReactNode} from 'react';
import type {TopicAttachmentSummary, TopicBlock, TopicEditableBlock} from '@cabildo-abierto/api';
import {AttachmentPagination} from '@/components/attachments/attachment-pagination';
import {AttachmentSearch} from '@/components/attachments/attachment-search';
import {TopicDocumentEditorItem} from './topic-document-editor-item';
import {DocumentSection} from './document-section';
import {AttachmentSectionAddButton} from '@/components/attachments/attachment-section-add-button';
import type {AttachmentInsertionAction} from '@/components/attachments/attachment-insertion-picker';
import {TopicDeletedBlockItem} from '@/components/topic-deleted-blocks';
import {useTopicAttachments} from '@/hooks/use-topic-attachments';
import {Button} from '@/components/ui/button';
import {Spinner} from '@/components/ui/spinner';
import {cn} from '@/lib/utils';

type WorkingAttachment = TopicEditableBlock & {isNew: boolean};
export function TopicDocumentEditor({topicId, blocks, summary, includeDeleted, disabled, onChange, onRemove, onRestore, onBusyChange, renderActions, insertionAction, dataset = false}: {
    dataset?: boolean; topicId: string; blocks: WorkingAttachment[]; summary: TopicAttachmentSummary; includeDeleted: boolean; disabled: boolean;
    insertionAction: AttachmentInsertionAction;
    onChange: (block: TopicBlock, original: TopicEditableBlock) => void;
    renderActions: (blockNumber: string, onClose: () => void) => ReactNode;
    onRemove: (block: WorkingAttachment) => void; onRestore: (block: TopicEditableBlock) => void;
    onBusyChange: (blockNumber: string, busy: boolean) => void;
}) {
    const [page, setPage] = useState(0);
    const [query, setQuery] = useState('');
    const [expanded, setExpanded] = useState(false);
    const [editingBlockNumber, setEditingBlockNumber] = useState<string | null>(null);
    const hasAttachments = summary.count + (includeDeleted ? summary.deletedCount : 0) > 0 || blocks.length > 0;
    const result = useTopicAttachments(topicId, dataset ? 'dataset' : 'documento', {search: query, page, includeDeleted, revision: summary.revision, enabled: expanded && hasAttachments});
    const pending = new Set(blocks.map(block => block.blockNumber));
    const pageBlocks = (result.loading || result.isError ? [] : result.data?.items ?? []).map(({block}) => ({...block, isNew: false})).filter(block => !pending.has(block.blockNumber));
    const visible = [...blocks, ...pageBlocks];
    const label = dataset ? 'conjuntos de datos' : 'documentos';
    if (!hasAttachments) return null;
    return <DocumentSection dataset={dataset} onExpandedChange={setExpanded}
        actions={<AttachmentSectionAddButton type={dataset ? 'dataset' : 'documento'} action={insertionAction} disabled={disabled}/>}
        endActions={<AttachmentSearch dataset={dataset} value={query} onChange={value => {setQuery(value); setPage(0);}}/>}
        after={result.data && result.data.total > result.data.pageSize && <div className={cn('mt-3')}>
            <AttachmentPagination total={result.data.total} page={result.data.page} pageSize={result.data.pageSize} label={label}
                disabled={disabled || editingBlockNumber !== null || result.loading} onPageChange={setPage}/>
        </div>}>
        {result.loading && <div role="status" aria-label={`Cargando ${label}`} className={cn('col-span-full flex justify-center py-4')}><Spinner/></div>}
        {result.isError && <div className={cn('col-span-full space-y-2')}><p role="alert" className={cn('text-xs text-destructive')}>{result.error.message}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => void result.refetch()}>Reintentar</Button></div>}
        {visible.map(block => <div key={block.blockNumber} className={cn('group/block relative')}>
            {block.deleted ? <TopicDeletedBlockItem topicId={topicId} block={block} openInPage={false} onRestore={() => onRestore(block)}/>
                : <TopicDocumentEditorItem topicId={topicId} block={block} isNew={block.isNew} disabled={disabled}
                    onEditingChange={editing => setEditingBlockNumber(editing ? block.blockNumber : null)}
                    renderActions={onClose => renderActions(block.blockNumber, onClose)} onChange={next => onChange(next, block)}
                    onRemove={() => onRemove(block)} onBusyChange={busy => onBusyChange(block.blockNumber, busy)}/>}
        </div>)}
        {!result.loading && !result.isError && !visible.length && <p className={cn('col-span-full py-2 text-xs text-muted-foreground')}>No encontramos {label} para esa búsqueda.</p>}
    </DocumentSection>;
}
