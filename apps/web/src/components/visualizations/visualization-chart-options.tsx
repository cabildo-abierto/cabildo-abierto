import type {VisualizationChart, DatasetColumn, AxisField} from '@cabildo-abierto/api';
import {PlusIcon, TrashIcon} from '@phosphor-icons/react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {VisualizationSelect} from './visualization-select';
import {VisualizationAxisOptions} from './visualization-axis-options';
import {VisualizationTableOptions} from './visualization-table-options';
import {VisualizationBinBoundaries} from './visualization-bin-boundaries';
import {cn} from '@/lib/utils';
export const chartTypes = [{value: 'bar', label: 'Barras'}, {value: 'line', label: 'Líneas'}, {value: 'scatter', label: 'Dispersión'}, {value: 'histogram', label: 'Histograma'}, {value: 'table', label: 'Tabla'}];
export function defaultChart(type: VisualizationChart['type'], columns: DatasetColumn[]): VisualizationChart {
    const numeric = columns.filter(c => c.type === 'integer' || c.type === 'decimal');
    const x = {field: (type === 'line' ? columns.find(c => c.type === 'date' || c.type === 'datetime') ?? numeric[0] : type === 'bar' ? columns.find(c => c.type === 'text') ?? columns[0] : numeric[0])?.name ?? ''};
    if (type === 'table') return {type, columns: columns.length ? columns.slice(0,200).map(c => ({field: c.name})) : [{field: ''}]};
    if (type === 'scatter') return {type, x, y: {field: numeric[1]?.name ?? numeric[0]?.name ?? ''}};
    if (type === 'histogram') return {type, x};
    return {type, x, series: [{field: numeric[0]?.name ?? ''}]};
}
export function VisualizationChartOptions({chart, columns, onChange}: {chart: VisualizationChart; columns: DatasetColumn[]; onChange: (chart: VisualizationChart) => void}) {
    const numeric = columns.filter(c => c.type === 'integer' || c.type === 'decimal');
    const opts = (columns: DatasetColumn[]) => columns.map(c => ({value: c.name, label: c.name}));
    return <div className={cn('space-y-3')}>
        <VisualizationSelect prominent label="Tipo de visualización" value={chart.type} options={chartTypes} onChange={type => onChange(defaultChart(type as VisualizationChart['type'], columns))}/>
        {chart.type !== 'table' && <VisualizationAxisOptions label="Eje X" value={chart.x} columns={chart.type === 'bar' ? columns : chart.type === 'line' ? columns.filter(c => ['integer','decimal','date','datetime'].includes(c.type)) : numeric} onChange={x => onChange({...chart, x: x as AxisField})}/>}
        {(chart.type === 'bar' || chart.type === 'line') && <>
            <fieldset className={cn('space-y-2')}><legend className={cn('mb-2 text-xs font-medium')}>Series</legend>
                {chart.series.map((series,i) => <div key={i} className={cn('space-y-2 rounded-md border p-2')}><div className={cn('flex items-end gap-1')}>
                    <div className={cn('min-w-0 flex-1')}><VisualizationSelect label={`Columna de la serie ${i+1}`} value={series.field} options={opts(numeric)} onChange={field => onChange({...chart, series: chart.series.map((s,j) => i === j ? {...s, field} : s)})}/></div>
                    <Button type="button" variant="ghost" size="icon-sm" disabled={chart.series.length === 1} aria-label="Quitar serie" onClick={() => onChange({...chart, series: chart.series.filter((_,j) => i !== j)})}><TrashIcon/></Button>
                </div><Input aria-label={`Etiqueta de la serie ${i+1}`} placeholder="Etiqueta (opcional)" value={series.label ?? ''} onChange={event => onChange({...chart, series: chart.series.map((s,j) => i === j ? {...s, label: event.target.value || undefined} : s)})}/></div>)}
                <Button type="button" size="xs" variant="outline" disabled={chart.series.length >= 12 || !numeric.length} onClick={() => onChange({...chart, series: [...chart.series, {field: numeric[0].name}]})}><PlusIcon/>Serie</Button>
            </fieldset>
            <VisualizationSelect label="Separar series por" optional value={chart.seriesBy?.field ?? ''} options={opts(columns)} onChange={field => onChange({...chart, seriesBy: field ? {field} : undefined})}/>
        </>}
        {chart.type === 'bar' && <div className={cn('grid grid-cols-2 gap-2')}>
            <VisualizationSelect label="Orientación" value={chart.orientation ?? 'vertical'} options={[{value: 'vertical', label: 'Vertical'}, {value: 'horizontal', label: 'Horizontal'}]} onChange={orientation => onChange({...chart, orientation: orientation as typeof chart.orientation})}/>
            <VisualizationSelect label="Disposición" value={chart.layout ?? 'grouped'} options={[{value: 'grouped', label: 'Agrupadas'}, {value: 'stacked', label: 'Apiladas'}]} onChange={layout => onChange({...chart, layout: layout as typeof chart.layout})}/>
        </div>}
        {chart.type === 'scatter' && <>
            <VisualizationAxisOptions label="Eje Y" value={chart.y} columns={numeric} onChange={y => onChange({...chart, y: y as AxisField})}/>
            <VisualizationSelect label="Color por" optional value={chart.color?.field ?? ''} options={opts(columns)} onChange={field => onChange({...chart, color: field ? {field} : undefined})}/>
            <VisualizationSelect label="Tamaño por" optional value={chart.size?.field ?? ''} options={opts(numeric)} onChange={field => onChange({...chart, size: field ? {field} : undefined})}/>
        </>}
        {chart.type === 'histogram' && <>
            <VisualizationSelect label="Intervalos" value={chart.bins?.mode ?? 'auto'} options={[{value: 'auto', label: 'Automáticos'}, {value: 'count', label: 'Cantidad'}, {value: 'boundaries', label: 'Límites explícitos'}]} onChange={mode => onChange({...chart, bins: mode === 'count' ? {mode, count: 10} : mode === 'boundaries' ? {mode, boundaries: [0,1]} : {mode: 'auto'}})}/>
            {chart.bins?.mode === 'count' && <Input aria-label="Cantidad de intervalos" type="number" min={1} max={100} value={chart.bins.count} onChange={event => onChange({...chart, bins: {mode: 'count', count: Number(event.target.value)}})}/>}
            {chart.bins?.mode === 'boundaries' && <VisualizationBinBoundaries boundaries={chart.bins.boundaries} onChange={boundaries => onChange({...chart, bins: {mode: 'boundaries', boundaries}})}/>}
            <VisualizationSelect label="Frecuencia" value={chart.frequency ?? 'count'} options={[{value: 'count', label: 'Cantidad'}, {value: 'relative', label: 'Relativa'}]} onChange={frequency => onChange({...chart, frequency: frequency as typeof chart.frequency})}/>
        </>}
        {chart.type !== 'table' && chart.type !== 'scatter' && <VisualizationAxisOptions label="Eje de valores" value={chart.yAxis ?? {}} numeric onChange={yAxis => onChange({...chart, yAxis})}/>}
        {chart.type === 'table' && <VisualizationTableOptions chart={chart} columns={columns} onChange={onChange}/>}
        {chart.type !== 'table' && <div className={cn('flex flex-wrap gap-2')}>
            <Button type="button" variant={chart.showGrid !== false ? 'secondary' : 'outline'} size="xs" aria-pressed={chart.showGrid !== false} onClick={() => onChange({...chart, showGrid: chart.showGrid === false})}>Grilla</Button>
            {chart.type !== 'histogram' && <Button type="button" variant={chart.showLegend !== false ? 'secondary' : 'outline'} size="xs" aria-pressed={chart.showLegend !== false} onClick={() => onChange({...chart, showLegend: chart.showLegend === false})}>Leyenda</Button>}
            {chart.type === 'line' && <Button type="button" variant={chart.showPoints ? 'secondary' : 'outline'} size="xs" aria-pressed={!!chart.showPoints} onClick={() => onChange({...chart, showPoints: !chart.showPoints})}>Puntos</Button>}
        </div>}
    </div>;
}
