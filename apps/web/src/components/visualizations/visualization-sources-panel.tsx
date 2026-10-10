"use client";
import type {TopicBlock} from '@cabildo-abierto/api';
import {parseVisualizationBlock} from '@cabildo-abierto/utils';
import {LccaSourcesPanel} from './lcca-sources-panel';

export function VisualizationSourcesPanel({block,id}: {block: TopicBlock; id: string}) {
    const content = parseVisualizationBlock(block.content);
    return <LccaSourcesPanel query={content?.query ?? ''} id={id}/>;
}
