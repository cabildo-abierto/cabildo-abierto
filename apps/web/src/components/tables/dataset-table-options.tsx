import type {DatasetColumn, DatasetTableContent, TableColumn} from '@cabildo-abierto/api';
import {ArrowDownIcon, ArrowUpIcon, EyeIcon, EyeSlashIcon} from '@phosphor-icons/react';
import {Button} from '@/components/ui/button';
import {NumberInput} from '@/components/ui/number-input';
import {Input} from '@/components/ui/input';
import {VisualizationSelect} from '@/components/visualizations/visualization-select';
import {cn} from '@/lib/utils';

export function DatasetTableOptions({value, columns, onChange}: {value: DatasetTableContent; columns: DatasetColumn[]; onChange: (value: DatasetTableContent) => void}) {
    const options: TableColumn[] = [...value.columns, ...columns.filter(column => !value.columns.some(item => item.field === column.name)).map(column => ({field: column.name}))];
    return <div className={cn('space-y-3')}>
        <div className={cn('grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3')}>{options.map(column => {
            const index = value.columns.findIndex(item => item.field === column.field);
            const shown = index >= 0;
            const move = (delta: number) => {const next = [...value.columns]; [next[index], next[index + delta]] = [next[index + delta], next[index]]; onChange({...value, columns: next});};
            return <div key={column.field} className={cn('min-w-0 space-y-2 rounded-md border p-2')}>
                <div className={cn('flex items-center gap-1')}><span title={column.field} className={cn('min-w-0 flex-1 truncate text-xs', !shown && 'text-muted-foreground')}>{column.field}</span>
                    <Button type="button" variant="ghost" size="icon-xs" aria-label={`${shown ? 'Ocultar' : 'Mostrar'} ${column.field}`} aria-pressed={shown} disabled={shown && value.columns.length === 1} onClick={() => onChange({...value, columns: shown ? value.columns.filter(item => item.field !== column.field) : [...value.columns, column], order: shown && value.order?.field === column.field ? null : value.order})}>{shown ? <EyeIcon/> : <EyeSlashIcon/>}</Button>
                    {shown && <><Button type="button" variant="ghost" size="icon-xs" aria-label={`Mover antes ${column.field}`} disabled={index === 0} onClick={() => move(-1)}><ArrowUpIcon/></Button><Button type="button" variant="ghost" size="icon-xs" aria-label={`Mover después ${column.field}`} disabled={index === value.columns.length - 1} onClick={() => move(1)}><ArrowDownIcon/></Button></>}
                </div>
                {shown && <Input aria-label={`Encabezado de ${column.field}`} placeholder="Encabezado (opcional)" maxLength={1000} value={column.label ?? ''} onChange={event => onChange({...value, columns: value.columns.map(item => item.field === column.field ? {...item, label: event.target.value || undefined} : item)})}/>}
            </div>;
        })}</div>
        <div className={cn('flex flex-wrap items-end gap-3 [&>label]:w-48 [&>label]:max-w-full [&>label:first-child]:w-36')}>
        <label className={cn('grid gap-1 text-xs')}>Filas por página<NumberInput className={cn('w-full')} min={1} max={100} value={value.pageSize} onValueChange={pageSize => {if (pageSize !== null) onChange({...value, pageSize});}}/></label>
        <VisualizationSelect label="Orden por defecto" optional value={value.order?.field ?? ''} options={value.columns.map(column => ({value: column.field, label: column.label || column.field}))} onChange={field => onChange({...value, order: field ? {field, direction: value.order?.direction ?? 'asc'} : null})}/>
        {value.order && <VisualizationSelect label="Dirección" value={value.order.direction} options={[{value: 'asc', label: 'Ascendente'}, {value: 'desc', label: 'Descendente'}]} onChange={direction => onChange({...value, order: {...value.order!, direction: direction as 'asc' | 'desc'}})}/>}
        </div>
    </div>;
}
