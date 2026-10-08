"use client";

import {useMemo} from 'react';
import {skipToken, useQuery} from '@tanstack/react-query';
import type {LccaOutput, TopicBlock} from '@cabildo-abierto/api';
import {parseVisualizationBlock} from '@cabildo-abierto/utils';
import {VisualizationExpandedView} from './visualization-expanded-view';
import {VisualizationRenderer} from './visualization-renderer';
import {VisualizationErrorBoundary} from './visualization-error-boundary';

export function VisualizationExpandButton({block}: {block: TopicBlock}) {
    const content = useMemo(() => parseVisualizationBlock(block.content), [block.content]);
    // Observe the result already loaded by VisualizationBlock without fetching it again.
    const result = useQuery<LccaOutput>({queryKey: ['lcca-query', content?.query], queryFn: skipToken, enabled: false, gcTime: 0});
    const resetKey = useMemo(() => ({content: block.content, table: result.data}), [block.content,result.data]);
    if (!content || !result.data || result.isFetching || result.error) return null;
    return <VisualizationExpandedView title={content.spec.title}>
        <VisualizationErrorBoundary resetKey={resetKey}>
            <VisualizationRenderer spec={content.spec} table={result.data} expanded/>
        </VisualizationErrorBoundary>
    </VisualizationExpandedView>;
}
