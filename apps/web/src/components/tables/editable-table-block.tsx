"use client";

import {memo, useMemo} from 'react';
import type {TopicBlock} from '@cabildo-abierto/api';
import {parseTableBlock} from '@cabildo-abierto/utils';
import {TopicBlockContent} from '@/components/topic-block-content';
import {useToast} from '@/components/ui/toast';
import {StaticTableEditor} from './static-table-editor';

export const EditableTableBlock = memo(function EditableTableBlock({topicId, block, footnoteNumbers, disabled, onChange}: {
    topicId: string; block: TopicBlock; footnoteNumbers: ReadonlyMap<string, number>;
    disabled: boolean; onChange: (block: TopicBlock) => void;
}) {
    const {toast} = useToast();
    const value = useMemo(() => parseTableBlock(block.content), [block.content]);
    if (value?.mode !== 'static') return <TopicBlockContent block={block} footnoteNumbers={footnoteNumbers}/>;
    return <StaticTableEditor inline value={value} topicId={topicId} footnoteNumbers={footnoteNumbers} disabled={disabled}
        onChange={next => {
            const content = JSON.stringify(next);
            if (!parseTableBlock(content)) {
                toast({title: 'La tabla supera el tamaño permitido.', variant: 'destructive'});
                return false;
            }
            onChange({...block, content});
        }}/>;
});
