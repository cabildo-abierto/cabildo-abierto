"use client";
import {useQuery} from '@tanstack/react-query';
import type {BasicDataView, DatasetSource} from '@cabildo-abierto/api';
import {PlusIcon, TrashIcon} from '@phosphor-icons/react';
import {dataViewRequest} from '@/utils/react/data-view-request';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import {VisualizationSelect} from './visualization-select';
import {DatasetSourceSelect} from './dataset-source-select';
import {DataViewFilter} from './data-view-filter';
export function DataViewForm({topicId, view, onChange, onSource}: {topicId: string; view: BasicDataView | null; onChange: (view: BasicDataView) => void; onSource: (source: DatasetSource) => void}) {
    const selected = useQuery({queryKey: ['dataset-source', view?.source.topicId, view?.source.blockNumber], enabled: !!view,
        queryFn: async () => {
            const output = await dataViewRequest<DatasetSource>(`/datasets/${encodeURIComponent(view!.source.topicId)}/${encodeURIComponent(view!.source.blockNumber)}`);
            return output;
        }, staleTime: 30000, retry: false});
    const source = selected.data;
    const columns = source?.columns ?? [];
    const columnOptions = columns.map(c => ({value: c.name, label: c.name}));
    const choose = (source: DatasetSource) => {
        onSource(source);
        onChange({source: {topicId: source.topicId, blockNumber: source.blockNumber}, columns: [], filters: [], filterMode: 'and', orderBy: []});
    };
    return <div className={cn('space-y-4')}>
        <DatasetSourceSelect topicId={topicId} value={source ?? null} onChange={choose}/>
        {selected.error && <p role="alert" className={cn('text-xs text-destructive')}>{selected.error.message}</p>}
        {view && source && <div className={cn(view.filters.length === 0 && view.orderBy.length === 0 ? 'flex items-center gap-2' : 'space-y-4')}>
            <div className={cn('space-y-2')}><div className={cn('flex items-center justify-between')}>{view.filters.length > 0 && <span className={cn('text-xs font-medium')}>Filtros</span>}<Button type="button" size="xs" variant="outline" disabled={!columns.length} onClick={() => onChange({...view, filters: [...view.filters, {field: columns[0].name, type: columns[0].type, operator: 'eq', values: ['']}]})}><PlusIcon/>Filtro</Button></div>
                {view.filters.length > 1 && <VisualizationSelect label="Combinar condiciones" value={view.filterMode} options={[{value: 'and', label: 'Todas (AND)'}, {value: 'or', label: 'Alguna (OR)'}]} onChange={filterMode => onChange({...view, filterMode: filterMode as 'and' | 'or'})}/>}
                {view.filters.map((filter,i) => <DataViewFilter key={i} filter={filter} columns={columns} onChange={filter => onChange({...view, filters: view.filters.map((current,j) => i === j ? filter : current)})} onRemove={() => onChange({...view, filters: view.filters.filter((_,j) => i !== j)})}/>)}
            </div>
            <div className={cn('space-y-2')}><div className={cn('flex items-center justify-between')}>{view.orderBy.length > 0 && <span className={cn('text-xs font-medium')}>Orden de las filas</span>}<Button type="button" variant="outline" size="xs" disabled={view.orderBy.length >= columns.length} onClick={() => onChange({...view, orderBy: [...view.orderBy, {field: columns.find(c => !view.orderBy.some(o => o.field === c.name))!.name, direction: 'asc'}]})}><PlusIcon/>Orden</Button></div>
                {view.orderBy.map((order,i) => <div key={i} className={cn('flex items-end gap-2')}>
                    <div className={cn('min-w-0 flex-1')}><VisualizationSelect label={`Columna de orden ${i+1}`} value={order.field} options={columnOptions.filter(c => c.value === order.field || !view.orderBy.some(o => o.field === c.value))} onChange={field => onChange({...view, orderBy: view.orderBy.map((o,j) => i === j ? {...o, field} : o)})}/></div>
                    <VisualizationSelect label="Dirección" value={order.direction} options={[{value: 'asc', label: 'Ascendente'}, {value: 'desc', label: 'Descendente'}]} onChange={direction => onChange({...view, orderBy: view.orderBy.map((o,j) => i === j ? {...o, direction: direction as 'asc' | 'desc'} : o)})}/>
                    <Button type="button" size="icon-sm" variant="ghost" aria-label="Quitar orden" onClick={() => onChange({...view, orderBy: view.orderBy.filter((_,j) => i !== j)})}><TrashIcon/></Button>
                </div>)}
            </div>
        </div>}
    </div>;
}
