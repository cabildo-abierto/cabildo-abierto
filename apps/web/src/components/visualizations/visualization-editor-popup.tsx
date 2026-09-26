"use client";
import {useCallback, useDeferredValue, useEffect, useMemo, useState} from 'react';
import {Dialog} from '@base-ui/react/dialog';
import {useQuery} from '@tanstack/react-query';
import {ChartBarIcon, XIcon} from '@phosphor-icons/react';
import type {BasicDataView, DatasetSource, LccaAnalysis, VisualizationContent, VisualizationSpecV1} from '@cabildo-abierto/api';
import {basicViewQuery, datasetCell, parseVisualizationBlock, prepareVisualization} from '@cabildo-abierto/utils';
import {post} from '@/utils/react/fetch';
import {dataViewRequest} from '@/utils/react/data-view-request';
import {useDebouncedValue} from '@/hooks/use-debounced-value';
import {usePreparedVisualization} from '@/hooks/use-prepared-visualization';
import {useLccaQuery} from '@/hooks/use-lcca-query';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Spinner} from '@/components/ui/spinner';
import {cn} from '@/lib/utils';
import {DataViewForm} from './data-view-form';
import {LccaQueryEditor} from './lcca-query-editor';
import {VisualizationPreview} from './visualization-preview';
import {VisualizationEditorPanels} from './visualization-editor-panels';
import {dataViewGuidance, visualizationConfigurationHelp} from './visualization-preview-guidance';
import {Tabs, TabsList, TabsTrigger, TabsContent} from '@/components/ui/tabs';
import {VisualizationChartOptions, defaultChart} from './visualization-chart-options';
export function VisualizationEditorPopup({topicId, initialContent, onConfirm, onClose}: {topicId: string; initialContent?: string; onConfirm: (content: string) => void; onClose: () => void}) {
    const initial = useMemo(() => parseVisualizationBlock(initialContent ?? ''), [initialContent]);
    const [spec,setSpec] = useState<VisualizationSpecV1>(() => initial?.spec ?? {schemaVersion: 1, chart: defaultChart('table', [])});
    const [mode,setMode] = useState<'basic' | 'advanced'>(initial ? 'advanced' : 'basic');
    const [view,setView] = useState<BasicDataView | null>(null);
    const [query,setQuery] = useState(initial?.query ?? '');
    const [analyzing,setAnalyzing] = useState(!!initial);
    const [initialLoading,setInitialLoading] = useState(!!initial);
    const [initialReady,setInitialReady] = useState(!initial);
    const [previewTab, setPreviewTab] = useState('visualization');
    const [confirmedError, setConfirmedError] = useState<{chart: VisualizationSpecV1['chart']; table: unknown; message: string} | null>(null);
    const [renderFailure,setRenderFailure] = useState<{spec: unknown; table: unknown; message: string} | null>(null);
    const [replace,setReplace] = useState(false);
    const [analysisError,setAnalysisError] = useState<string | null>(null);
    useEffect(() => {
        if (!initial) return;
        let active = true;
        void post<{query: string; queryLanguageVersion: 1},LccaAnalysis>('/lcca/analyze', {query: initial.query, queryLanguageVersion: 1}).then(output => {
            if (!active) return;
            setAnalyzing(false);
            setInitialLoading(false);
            if ('error' in output) { setAnalysisError(output.error); return; }
            if (output.value.basicView) { setView(output.value.basicView); setMode('basic'); }
        });
        return () => { active = false; };
    }, [initial]);
    const source = useQuery({queryKey: ['dataset-source', view?.source.topicId, view?.source.blockNumber], enabled: !!view,
        queryFn: async () => {
            const output = await dataViewRequest<DatasetSource>(`/datasets/${encodeURIComponent(view!.source.topicId)}/${encodeURIComponent(view!.source.blockNumber)}`);
            return output;
        }, retry: false});
    const generated = useMemo(() => {
        if (!view || (view.filters.length && !source.data)) return {query: '', error: null};
        try {
            const normalized: BasicDataView = {...view, filters: view.filters.map(filter => {
                const column = source.data?.columns.find(c => c.name === filter.field);
                if (!column) throw new Error(`No encontramos la columna «${filter.field}».`);
                const noValue = filter.operator === 'isNull' || filter.operator === 'isNotNull';
                const values = noValue ? [] : filter.values.map(value => {
                    if (column.type === 'text') return String(value);
                    const cell = datasetCell(String(value), column.type, {decimal: '.', delimiter: ','});
                    if (cell.error || cell.value === null) throw new Error(`Completá un valor válido para «${filter.field}».`);
                    return cell.value;
                });
                return {...filter, type: column.type, values};
            })};
            return {query: basicViewQuery(normalized), error: null};
        } catch (error) { return {query: '', error: error instanceof Error ? error.message : 'Revisá los filtros.'}; }
    }, [view, source.data]);
    const currentQuery = mode === 'basic' ? generated.query : query;
    const result = useLccaQuery(currentQuery, !analyzing);
    useEffect(() => {
        if (!initialReady && !initialLoading && !(mode === 'basic' && !!view && source.isPending) && !result.loading) setInitialReady(true);
    }, [initialReady,initialLoading,mode,view,source.isPending,result.loading]);
    const viewColumns = result.data?.columns;
    useEffect(() => {
        if (!viewColumns || spec.chart.type !== 'table') return;
        setSpec(current => {
            const chart = current.chart;
            if (chart.type !== 'table' || (chart.columns.length === viewColumns.length && chart.columns.every((column,i) => column.field === viewColumns[i].name))) return current;
            const columns = viewColumns.map(column => chart.columns.find(existing => existing.field === column.name) ?? {field: column.name});
            return {...current,chart: {...chart,columns}};
        });
    }, [viewColumns,spec.chart.type]);
    const previewSpec = useDeferredValue(useDebouncedValue(spec, 250));
    const [previousTable, setPreviousTable] = useState(result.data);
    useEffect(() => { if (result.data) setPreviousTable(result.data); }, [result.data]);
    const previewTable = result.data ?? (result.loading ? previousTable : undefined);
    const prepared = usePreparedVisualization(previewSpec, previewTable, previewTab === 'visualization');
    const renderError = renderFailure?.spec === previewSpec && renderFailure?.table === previewTable ? renderFailure.message : null;
    const onRenderError = useCallback((cause: Error) => setRenderFailure({spec: previewSpec, table: previewTable, message: cause.message}), [previewSpec, previewTable]);
    const viewMessage = useMemo(() => dataViewGuidance({mode,hasSource: !!view,query: currentQuery,
        loading: result.loading || analyzing || (mode === 'basic' && !!view && source.isPending),
        formError: generated.error,requestError: (mode === 'basic' ? source.error : null) ?? result.error}),
        [mode,view,currentQuery,result.loading,analyzing,source.isPending,generated.error,source.error,result.error]);
    const configurationHelp = useMemo(() => previewTable ? visualizationConfigurationHelp(previewSpec,previewTable) : null, [previewSpec,previewTable]);
    const currentHelp = useMemo(() => result.data ? visualizationConfigurationHelp(spec,result.data) : null, [spec,result.data]);
    const confirmationError = confirmedError?.chart === spec.chart && confirmedError?.table === result.data ? confirmedError.message : null;
    const preparationCurrent = previewSpec.chart === spec.chart && previewTable === result.data;
    const canConfirm = !!currentQuery.trim() && !!result.data && !viewMessage && !currentHelp && !confirmationError
        && (previewTab === 'data' || (preparationCurrent && !!prepared.data && !renderError));
    const switchToBasic = async () => {
        setAnalysisError(null); setReplace(false);
        if (!query.trim()) { setMode('basic'); return; }
        setAnalyzing(true);
        const output = await post<{query: string; queryLanguageVersion: 1},LccaAnalysis>('/lcca/analyze', {query, queryLanguageVersion: 1});
        setAnalyzing(false);
        if ('error' in output) { setAnalysisError(output.error); return; }
        if (output.value.basicView) { setView(output.value.basicView); setMode('basic'); }
        else setReplace(true);
    };
    const confirm = () => {
        if (!canConfirm) return;
        if (previewTab === 'data' || !preparationCurrent) {
            try { prepareVisualization(spec, result.data!); }
            catch (cause) {
                setConfirmedError({chart: spec.chart, table: result.data, message: cause instanceof Error ? cause.message : 'Revisá la configuración del gráfico.'});
                setPreviewTab('visualization');
                return;
            }
        }
        const content: VisualizationContent = {query: currentQuery, queryLanguageVersion: 1, spec};
        onConfirm(JSON.stringify(content));
    };
    return <Dialog.Root open disablePointerDismissal onOpenChange={open => { if (!open) onClose(); }}>
        <Dialog.Portal>
            <Dialog.Backdrop data-attachment-editor-popup className={cn('fixed inset-0 z-50 bg-black/40')}/>
            <Dialog.Popup data-attachment-editor-popup className={cn('fixed top-1/2 left-1/2 z-50 flex h-[90dvh] w-[calc(100vw-2rem)] max-w-6xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-xl outline-none')} onMouseDown={event => event.stopPropagation()}>
                <header className={cn('flex shrink-0 items-center gap-2 border-b px-4 py-3')}><ChartBarIcon className={cn('size-4 text-muted-foreground')}/><Dialog.Title className={cn('flex-1 text-sm font-medium')}>{initial ? 'Editar' : 'Insertar'} visualización</Dialog.Title><Dialog.Close render={<Button type="button" variant="ghost" size="icon-sm"/>} aria-label="Cerrar"><XIcon/></Dialog.Close></header>
                <Dialog.Description className={cn('sr-only')}>Configurá la vista de datos y su representación visual.</Dialog.Description>
                <VisualizationEditorPanels>
                    {!initialReady ? <div role="status" aria-label="Cargando editor" className={cn('flex min-h-48 min-w-0 items-center justify-center border-b md:border-b-0')}><Spinner className={cn('size-6')}/></div> : <ScrollArea className={cn('min-h-0 min-w-0 border-b md:border-b-0')} viewportClassName={cn('md:h-full')}>
                        <div className={cn('space-y-5 p-4')}>
                            <section className={cn('space-y-3')}><h3 className={cn('text-sm font-medium')}>Vista de datos</h3>
                                <Tabs value={mode} onValueChange={value => {
                                    setAnalysisError(null); setReplace(false);
                                    if (value === 'basic' && mode === 'advanced') void switchToBasic();
                                    if (value === 'advanced' && mode === 'basic') { setQuery(currentQuery); setMode('advanced'); }
                                }} className={cn('space-y-3')}>
                                <div className={cn('flex items-center gap-2')}><TabsList aria-label="Editor de la vista de datos"><TabsTrigger value="basic" disabled={analyzing}>Formulario</TabsTrigger><TabsTrigger value="advanced" disabled={analyzing || (mode === 'basic' && !!view && (!currentQuery || !!generated.error))}>LCCA</TabsTrigger></TabsList>{analyzing && <Spinner/>}</div>
                                {replace && <div className={cn('space-y-2 rounded-md border p-3 text-xs')}><p>Esta consulta no se puede representar con el formulario. Reemplazarla descarta la consulta avanzada.</p><div className={cn('flex gap-2')}><Button type="button" size="xs" variant="outline" onClick={() => setReplace(false)}>Conservar LCCA</Button><Button type="button" size="xs" onClick={() => { setView(null); setMode('basic'); setReplace(false); }}>Reemplazar consulta</Button></div></div>}
                                {analysisError && <p role="alert" className={cn('text-xs text-muted-foreground')}>{analysisError}</p>}
                                <TabsContent value="basic"><DataViewForm topicId={topicId} view={view} onChange={setView} onSource={source => setSpec(current => ({...current, chart: defaultChart(current.chart.type,source.columns)}))}/></TabsContent>
                                <TabsContent value="advanced"><LccaQueryEditor topicId={topicId} query={query} onChange={value => { setQuery(value); setAnalysisError(null); setReplace(false); }}/></TabsContent>
                                </Tabs>
                            </section>
                            <section className={cn('space-y-3 border-t pt-4')}><h3 className={cn('text-sm font-medium')}>Visualización</h3>
                                <Input aria-label="Título opcional" placeholder="Título (opcional)" maxLength={200} value={spec.title ?? ''} onChange={event => setSpec({...spec, title: event.target.value || undefined})}/>
                                <Textarea aria-label="Descripción opcional" placeholder="Descripción (opcional)" maxLength={5000} value={spec.description ?? ''} onChange={event => setSpec({...spec, description: event.target.value || undefined})}/>
                                <VisualizationChartOptions chart={spec.chart} columns={result.data?.columns ?? []} onChange={chart => setSpec({...spec,chart})}/>
                                <label className={cn('grid gap-1 text-xs text-muted-foreground')}>Relación ancho/alto<Input type="number" min={0.5} max={3} step={0.1} value={spec.layout?.aspectRatio ?? 1.6} onChange={event => setSpec({...spec,layout: {aspectRatio: Number(event.target.value)}})}/></label>
                            </section>
                        </div>
                    </ScrollArea>}
                    <ScrollArea className={cn('min-h-0 min-w-0')} viewportClassName={cn('md:h-full')}><VisualizationPreview spec={previewSpec} table={previewTable} mode={mode} viewMessage={viewMessage} configurationHelp={configurationHelp} renderError={renderError} onRenderError={onRenderError} prepared={prepared} tab={previewTab} onTabChange={setPreviewTab} updating={previewSpec !== spec || result.loading || analyzing || (mode === 'basic' && !!view && source.isPending)}/></ScrollArea>
                </VisualizationEditorPanels>
                <footer className={cn('flex shrink-0 justify-end gap-2 border-t px-4 py-3')}><Button type="button" size="sm" variant="outline" onClick={onClose}>Cancelar</Button><Button type="button" size="sm" disabled={!canConfirm} onClick={confirm}>{initial ? 'Confirmar cambios' : 'Agregar visualización'}</Button></footer>
            </Dialog.Popup>
        </Dialog.Portal>
    </Dialog.Root>;
}
