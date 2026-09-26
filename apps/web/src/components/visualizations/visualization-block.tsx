"use client";
import {useEffect, useMemo, useRef, useState} from 'react';
import {parseVisualizationBlock} from '@cabildo-abierto/utils';
import type {TopicBlock} from '@cabildo-abierto/api';
import {useLccaQuery} from '@/hooks/use-lcca-query';
import {usePreparedVisualization} from '@/hooks/use-prepared-visualization';
import {Spinner} from '@/components/ui/spinner';
import {cn} from '@/lib/utils';
import {VisualizationErrorBoundary} from './visualization-error-boundary';
import {VisualizationRenderer} from './visualization-renderer';
export function VisualizationBlock({block, onValidityChange, refreshOnMount = true, preview = false}: {block: TopicBlock; onValidityChange?: (valid: boolean) => void; refreshOnMount?: boolean; preview?: boolean}) {
    const content = useMemo(() => parseVisualizationBlock(block.content), [block.content]);
    const [renderFailure, setRenderFailure] = useState<{content: string; table: unknown} | null>(null);
    const result = useLccaQuery(content?.query ?? '', !!content,refreshOnMount);
    const resetKey = useMemo(() => ({content: block.content, table: result.data}), [block.content,result.data]);
    const prepared = usePreparedVisualization(content?.spec ?? {schemaVersion: 1, chart: {type: 'table', columns: []}}, result.data, !!content);
    const valid = !(renderFailure?.content === block.content && renderFailure?.table === result.data) && !!content && !!result.data && !result.loading && !result.error && !!prepared.data;
    const validityCallback = useRef(onValidityChange);
    validityCallback.current = onValidityChange;
    useEffect(() => { validityCallback.current?.(valid); }, [valid,block.content]);
    if (!content) return <p role="alert" className={cn('text-sm text-destructive',preview && 'text-xs')}>La configuración de la visualización no es válida.</p>;
    if (result.loading) return <div className={cn('flex items-center justify-center',preview ? 'min-h-24' : 'min-h-40')}><Spinner className={cn('size-6')}/></div>;
    if (result.error) return <p role="alert" className={cn('rounded-md border border-destructive/30 p-3 text-sm text-destructive',preview && 'p-2 text-xs')}>{result.error.message}</p>;
    return result.data ? <VisualizationErrorBoundary resetKey={resetKey} onError={() => setRenderFailure({content: block.content,table: result.data})}><VisualizationRenderer spec={content.spec} table={result.data} preview={preview} prepared={prepared}/></VisualizationErrorBoundary> : null;
}
