import type {AxisOptions, AxisField, DatasetColumn} from '@cabildo-abierto/api';
import {Input} from '@/components/ui/input';
import {VisualizationAngleInput} from './visualization-angle-input';
import {VisualizationSelect} from './visualization-select';
import {VisualizationFormatOptions} from './visualization-format-options';
import {cn} from '@/lib/utils';
export function VisualizationAxisOptions({label, value, columns, onChange, numeric = false}: {label: string; value: AxisField | AxisOptions; columns?: DatasetColumn[]; onChange: (value: AxisField | AxisOptions) => void; numeric?: boolean}) {
    const field = 'field' in value ? value.field : undefined;
    const type = numeric ? 'decimal' : columns?.find(c => c.name === field)?.type;
    return <fieldset className={cn('space-y-2 rounded-md border p-2')}><legend className={cn('px-1 text-xs font-medium')}>{label}</legend>
        {columns && field !== undefined && <VisualizationSelect label="Columna" value={field} options={columns.map(c => ({value: c.name, label: c.name}))} onChange={field => onChange({...value, field})}/>}
        <Input aria-label={`Etiqueta de ${label}`} placeholder="Etiqueta del eje (opcional)" value={value.label ?? ''} onChange={event => onChange({...value, label: event.target.value || undefined})}/>
        <VisualizationFormatOptions type={type} format={value.format} onChange={format => onChange({...value, format})}/>
        <div className={cn('grid grid-cols-2 gap-2')}>
            <label className={cn('grid gap-1 text-xs text-muted-foreground')}>Marcas<Input type="number" min={2} max={20} value={value.tickCount ?? ''} placeholder="Auto" onChange={event => onChange({...value, tickCount: event.target.value ? Number(event.target.value) : undefined})}/></label>
            <label className={cn('grid gap-1 text-xs text-muted-foreground')}>Rotación<VisualizationAngleInput label={label} value={value.tickLabelAngle ?? 0} onChange={tickLabelAngle => onChange({...value, tickLabelAngle})}/></label>
        </div>
    </fieldset>;
}
