"use client";

import type {TopicBlock} from '@cabildo-abierto/api';
import {parseTableBlock} from '@cabildo-abierto/utils';
import {ExpandedView} from '@/components/expanded-view';
import {TableBlock} from './table-block';

export function TableExpandButton({block}: {block: TopicBlock}) {
    if (!parseTableBlock(block.content)) return null;
    return <ExpandedView kind="table">
        <TableBlock block={block} linksEnabled refreshOnMount={false}/>
    </ExpandedView>;
}
