import type {DatasetColumnType, ValueFormat} from '@cabildo-abierto/api';
import {Input} from '@/components/ui/input';
import {VisualizationSelect} from './visualization-select';
import {cn} from '@/lib/utils';
export function VisualizationFormatOptions({type, format, onChange}: {type?: DatasetColumnType; format?: ValueFormat; onChange: (format?: ValueFormat) => void}) {
    const temporal = type === 'date' || type === 'datetime';
    const numeric = type === 'integer' || type === 'decimal';
    if (!temporal && !numeric && !format) return null;
    return <div className={cn('flex flex-wrap items-end gap-2')}>
        <div className={cn('min-w-32 flex-1')}><VisualizationSelect label="Formato" optional value={format?.type ?? ''} options={temporal ? [{value: 'date', label: 'Fecha'}] : [{value: 'number', label: 'Número'}, {value: 'percent', label: 'Porcentaje'}]} onChange={value => onChange(value ? {type: value as ValueFormat['type']} as ValueFormat : undefined)}/></div>
        {format && format.type !== 'date' && <label className={cn('grid w-20 gap-1 text-xs text-muted-foreground')}>Decimales<Input type="number" min={0} max={12} value={format.precision ?? ''} onChange={event => onChange({...format, precision: event.target.value === '' ? undefined : Number(event.target.value)})}/></label>}
        {format?.type === 'date' && <VisualizationSelect label="Detalle" value={format.style ?? 'date'} options={[{value: 'date', label: 'Fecha'}, {value: 'datetime', label: 'Fecha y hora'}, {value: 'month', label: 'Mes'}, {value: 'year', label: 'Año'}]} onChange={style => onChange({...format, style: style as typeof format.style})}/>}
    </div>;
}
