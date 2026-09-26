import type {DatasetColumn, ViewFilter, ViewFilterOperator} from '@cabildo-abierto/api';
import {TrashIcon} from '@phosphor-icons/react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {VisualizationSelect} from './visualization-select';
import {cn} from '@/lib/utils';
const labels: Record<ViewFilterOperator, string> = {eq: 'Es igual a', ne: 'Es distinto de', lt: 'Es menor que', lte: 'Es menor o igual que', gt: 'Es mayor que', gte: 'Es mayor o igual que', in: 'Está entre estos valores', notIn: 'No está entre estos valores', contains: 'Contiene', isNull: 'Está vacío', isNotNull: 'No está vacío'};
export function DataViewFilter({filter, columns, onChange, onRemove}: {filter: ViewFilter; columns: DatasetColumn[]; onChange: (filter: ViewFilter) => void; onRemove: () => void}) {
    const column = columns.find(c => c.name === filter.field);
    const operators: ViewFilterOperator[] = ['eq', 'ne', 'in', 'notIn', 'isNull', 'isNotNull', ...(column?.type === 'text' ? ['contains' as const] : column?.type === 'boolean' ? [] : ['lt', 'lte', 'gt', 'gte'] as const)];
    const list = filter.operator === 'in' || filter.operator === 'notIn';
    const noValue = filter.operator === 'isNull' || filter.operator === 'isNotNull';
    return <div className={cn('flex items-start gap-2 rounded-md border p-2')}>
        <div className={cn('min-w-0 flex-1 space-y-2')}>
        <VisualizationSelect label="Columna del filtro" value={filter.field} options={columns.map(c => ({value: c.name, label: c.name}))} onChange={field => onChange({field, type: columns.find(c => c.name === field)!.type, operator: 'eq', values: ['']})}/>
        <VisualizationSelect label="Condición" value={filter.operator} options={operators.map(value => ({value, label: labels[value]}))} onChange={operator => onChange({...filter, operator: operator as ViewFilterOperator})}/>
        {!noValue && (list ? <Textarea aria-label="Valores del filtro, uno por línea" placeholder="Un valor por línea" className={cn('min-h-16 text-xs')} value={filter.values.join('\n')} onChange={event => onChange({...filter, values: event.target.value.split('\n')})}/>
            : column?.type === 'boolean' ? <VisualizationSelect label="Valor del filtro" value={String(filter.values[0] ?? '')} options={[{value: 'true', label: 'Verdadero'}, {value: 'false', label: 'Falso'}]} onChange={value => onChange({...filter, values: [value]})}/>
                : <Input aria-label="Valor del filtro" placeholder={column?.type === 'date' ? 'AAAA-MM-DD' : column?.type === 'datetime' ? 'AAAA-MM-DDTHH:mm:ssZ' : 'Valor'} value={String(filter.values[0] ?? '')} onChange={event => onChange({...filter, values: [event.target.value]})}/>) }
        </div>
        <Button type="button" variant="ghost" size="icon-xs" aria-label="Quitar filtro" title="Quitar filtro" onClick={onRemove}><TrashIcon/></Button>
    </div>;
}
