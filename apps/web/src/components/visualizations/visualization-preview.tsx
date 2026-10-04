import {memo, useMemo} from 'react';
import type {LccaOutput, VisualizationSpecV1} from '@cabildo-abierto/api';
import {Tabs, TabsList, TabsTrigger, TabsContent} from '@/components/ui/tabs';
import type {PreparedVisualization} from '@/hooks/use-prepared-visualization';
import {cn} from '@/lib/utils';
import {VisualizationRenderer} from './visualization-renderer';
import {VisualizationTable} from './visualization-table';
import {VisualizationDatasetDescriptions} from './visualization-dataset-descriptions';
import {VisualizationErrorBoundary} from './visualization-error-boundary';
import {VisualizationUpdatingFrame} from './visualization-updating-frame';
import {VisualizationPreviewMessage, type PreviewMessage} from './visualization-preview-message';

export const VisualizationPreview = memo(function VisualizationPreview({spec, table, mode, viewMessage, configurationHelp, renderError, onRenderError, prepared, tab, onTabChange, updating}: {spec: VisualizationSpecV1; table?: LccaOutput; mode: 'basic' | 'advanced'; viewMessage: PreviewMessage | null; configurationHelp: PreviewMessage | null; renderError: string | null; onRenderError: (error: Error) => void; prepared: PreparedVisualization; tab: string; onTabChange: (tab: string) => void; updating: boolean}) {
    const resetKey = useMemo(() => ({spec,table}), [spec,table]);
    const dataChart = useMemo(() => ({type: 'table' as const, columns: table?.columns.map(column => ({field: column.name})) ?? []}), [table]);
    let chartMessage: PreviewMessage | null = null;
    if (table && (!viewMessage || viewMessage.tone === 'loading')) {
        if (!table.rows.length) chartMessage = {tone: 'help',title: 'La vista es válida, pero no tiene filas',description: mode === 'basic' ? 'Revisá los filtros o elegí otro conjunto de datos para obtener filas que puedas visualizar.' : 'Revisá las condiciones DONDE / WHERE y los conjuntos de datos de la consulta para obtener filas que puedas visualizar.'};
        else if (configurationHelp) chartMessage = configurationHelp;
        else if (renderError) chartMessage = {tone: 'system',title: 'No pudimos mostrar la visualización',description: 'Ocurrió un problema al dibujar el gráfico. Reintentá en unos momentos.',detail: renderError};
        else if (prepared.error) chartMessage = {tone: 'help',title: 'Revisá la configuración del gráfico',description: prepared.error};
        else if (prepared.empty) chartMessage = {tone: 'help',title: 'Elegí columnas con valores para el gráfico',description: 'Las columnas elegidas no tienen valores para representar. Probá con otras columnas o revisá la vista de datos.'};
    }
    return <section className={cn('min-w-0 space-y-3 p-4')}>
        <h3 className={cn('text-sm font-medium')}>Vista previa</h3>
        {viewMessage && (viewMessage.tone !== 'loading' || !table) ? <VisualizationPreviewMessage message={viewMessage}/> : !table ? <VisualizationPreviewMessage message={{tone: 'help',title: 'Primero, prepará la vista de datos',description: mode === 'basic' ? 'Elegí un conjunto de datos y configurá la visualización para empezar.' : 'Escribí una consulta LCCA que devuelva una tabla para empezar.'}}/> :
        <Tabs value={tab} onValueChange={value => onTabChange(String(value))} className={cn('space-y-3')}>
            {viewMessage?.tone === 'loading' && <p role="status" className={cn('text-xs text-muted-foreground')}>Actualizando la vista de datos…</p>}
            <TabsList aria-label="Vista previa"><TabsTrigger value="visualization">Visualización</TabsTrigger><TabsTrigger value="data">Datos</TabsTrigger></TabsList>
                <TabsContent value="visualization">
                    {tab === 'visualization' && (
                    chartMessage ? <VisualizationPreviewMessage message={chartMessage}/> : <VisualizationUpdatingFrame updating={updating}>
                        <VisualizationErrorBoundary resetKey={resetKey} onError={onRenderError}><VisualizationRenderer spec={spec} table={table} prepared={prepared} showDimensions={false}/></VisualizationErrorBoundary>
                    </VisualizationUpdatingFrame>
                    )}
                    {tab === 'visualization' && spec.chart.type === 'table' && !chartMessage && <VisualizationDatasetDescriptions sources={table.sources}/>}
                </TabsContent>
                <TabsContent value="data">
                    {tab === 'data' && <>
                        <VisualizationTable chart={dataChart} table={table} aspectRatio={1.6}/>
                        <VisualizationDatasetDescriptions sources={table.sources}/>
                    </>}
                </TabsContent>
        </Tabs>}
    </section>;
});
