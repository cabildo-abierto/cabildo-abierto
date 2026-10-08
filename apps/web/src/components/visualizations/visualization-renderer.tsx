"use client";
import {memo, useEffect, useRef, useState} from 'react';
import type {TypedTable, VisualizationSpecV1} from '@cabildo-abierto/api';
import {usePreparedVisualization, type PreparedVisualization} from '@/hooks/use-prepared-visualization';
import {cn} from '@/lib/utils';
import {VisualizationHistogramPlot} from './visualization-histogram-plot';
import {VisualizationBarPlot} from './visualization-bar-plot';
import {VisualizationPointPlot} from './visualization-point-plot';
import {VisualizationTablePreview} from './visualization-table-preview';
import {VisualizationTable} from './visualization-table';
import {VisualizationLegend} from './visualization-legend';
export const VisualizationRenderer = memo(function VisualizationRenderer({spec, table, preview = false, prepared, showDimensions = true, expanded = false}: {spec: VisualizationSpecV1; table: TypedTable; preview?: boolean; prepared?: PreparedVisualization; showDimensions?: boolean; expanded?: boolean}) {
    const ref = useRef<HTMLDivElement>(null);
    const [width,setWidth] = useState(0);
    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        const observer = new ResizeObserver(entries => setWidth(entries[0]?.contentRect.width ?? 0));
        observer.observe(element); return () => observer.disconnect();
    }, []);
    const computed = usePreparedVisualization(spec, table, !prepared);
    const {data, error, empty} = prepared ?? computed;
    const aspectRatio = spec.layout?.aspectRatio ?? 1.6;
    const height = preview ? 120 : Math.max(width < 480 ? 260 : 180, expanded ? Math.min(600,width/aspectRatio) : width/aspectRatio);
    const labels = data?.kind === 'bar' ? data.labels : data?.kind === 'line' || data?.kind === 'scatter' ? data.series.map(s => s.label) : [];
    const legend = spec.chart.type !== 'table' && spec.chart.type !== 'histogram' && spec.chart.showLegend !== false && (spec.chart.type === 'scatter' ? !!spec.chart.color : labels.length > 1);
    return <div ref={ref} aria-label={preview ? 'Vista previa de la visualización' : undefined} className={cn('w-full min-w-0 space-y-2',preview && 'overflow-hidden rounded-md border bg-background p-2')}>
        {!expanded && spec.title && <h4 title={preview ? spec.title : undefined} className={cn('text-sm font-medium',preview && 'truncate text-xs')}>{spec.title}</h4>}
        {!preview && spec.description && <p className={cn('whitespace-pre-wrap text-xs text-muted-foreground')}>{spec.description}</p>}
        {error ? <p role="alert" className={cn('rounded-md border border-destructive/30 p-3 text-sm text-destructive',preview && 'p-2 text-xs')}>{error}</p> : empty ? <p className={cn('py-8 text-center text-sm text-muted-foreground',preview && 'py-4 text-xs')}>Sin datos para esta configuración.</p> : <>
            {data?.kind === 'table' && spec.chart.type === 'table' && (preview ? <VisualizationTablePreview chart={spec.chart} table={table}/> : <VisualizationTable key={JSON.stringify(spec.chart)} chart={spec.chart} table={table} aspectRatio={aspectRatio} showDimensions={showDimensions}/>)}
            {width > 0 && data?.kind === 'bar' && spec.chart.type === 'bar' && <VisualizationBarPlot chart={spec.chart} rows={data.rows} labels={data.labels} width={width} height={height} preview={preview}/>}
            {width > 0 && data?.kind === 'bar' && spec.chart.type === 'histogram' && <VisualizationHistogramPlot chart={spec.chart} rows={data.rows} width={width} height={height} preview={preview}/>}
            {width > 0 && (data?.kind === 'line' || data?.kind === 'scatter') && (spec.chart.type === 'line' || spec.chart.type === 'scatter') && <VisualizationPointPlot chart={spec.chart} series={data.series} temporal={data.temporal} width={width} height={height} preview={preview}/>}
            {!preview && legend && <VisualizationLegend labels={labels}/>}
        </>}
    </div>;
});
