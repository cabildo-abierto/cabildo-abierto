"use client";
import type {TopicBlock} from '@cabildo-abierto/api';
import {parseTableBlock} from '@cabildo-abierto/utils';
import {DatasetTable} from './dataset-table';
import {StaticTable} from './static-table';
import {cn} from '@/lib/utils';

export function TableBlock({block, linksEnabled, footnoteNumbers, refreshOnMount}: {block: TopicBlock; linksEnabled: boolean; footnoteNumbers?: ReadonlyMap<string, number>; refreshOnMount: boolean}) {
    const value = parseTableBlock(block.content);
    if (!value) return <p role="alert" className={cn('text-xs text-destructive')}>La tabla tiene una configuración inválida.</p>;
    return value.mode === 'static' ? <StaticTable value={value} linksEnabled={linksEnabled} footnoteNumbers={footnoteNumbers} refreshOnMount={refreshOnMount}/>
        : <DatasetTable key={JSON.stringify(value)} value={value}/>;
}
