import {useRef} from 'react';
import type {DatasetColumn, TableChart, TableColumn} from '@cabildo-abierto/api';
import {ArrowDownIcon, ArrowUpIcon, EyeIcon, EyeSlashIcon} from '@phosphor-icons/react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {cn} from '@/lib/utils';
import {VisualizationFormatOptions} from './visualization-format-options';

export function VisualizationTableOptions({chart, columns, onChange}: {chart: TableChart; columns: DatasetColumn[]; onChange: (chart: TableChart) => void}) {
    const hidden = useRef(new Map<string, TableColumn>());
    const visible = new Set(chart.columns.map(column => column.field));
    const options = [...chart.columns, ...columns.filter(column => !visible.has(column.name)).map(column => hidden.current.get(column.name) ?? {field: column.name})];
    return <div className={cn('space-y-2')}>
        {options.map(column => {
            const index = chart.columns.findIndex(item => item.field === column.field);
            const shown = index !== -1;
            const metadata = columns.find(item => item.name === column.field);
            const update = (next: TableColumn) => onChange({...chart, columns: chart.columns.map(item => item.field === column.field ? next : item)});
            const toggle = () => {
                if (shown) hidden.current.set(column.field, column);
                onChange({...chart, columns: shown ? chart.columns.filter(item => item.field !== column.field) : [...chart.columns, column]});
            };
            const move = (delta: number) => {
                const next = [...chart.columns];
                [next[index], next[index + delta]] = [next[index + delta], next[index]];
                onChange({...chart, columns: next});
            };
            return <div key={column.field} className={cn('space-y-2 rounded-md border p-2')}>
                <div className={cn('flex items-center gap-1')}>
                    <span className={cn('min-w-0 flex-1 truncate text-xs font-medium', !shown && 'text-muted-foreground')} title={column.field}>{column.field || 'Columna sin configurar'}</span>
                    <Button type="button" variant="ghost" size="icon-xs" aria-label={`${shown ? 'Ocultar' : 'Mostrar'} columna ${column.field}`} aria-pressed={shown} disabled={shown ? chart.columns.length === 1 : chart.columns.length >= 200} onClick={toggle}>{shown ? <EyeIcon/> : <EyeSlashIcon/>}</Button>
                    {shown && <>
                        <Button type="button" variant="ghost" size="icon-xs" aria-label={`Mover a la izquierda ${column.field}`} disabled={index === 0} onClick={() => move(-1)}><ArrowUpIcon/></Button>
                        <Button type="button" variant="ghost" size="icon-xs" aria-label={`Mover a la derecha ${column.field}`} disabled={index === chart.columns.length - 1} onClick={() => move(1)}><ArrowDownIcon/></Button>
                    </>}
                </div>
                {shown && <>
                    {!metadata && <p className={cn('text-xs text-destructive')}>Esta columna no está disponible. Ocultala y elegí otra.</p>}
                    <Input aria-label={`Encabezado de ${column.field}`} value={column.label ?? ''} placeholder="Encabezado (opcional)" onChange={event => update({...column, label: event.target.value || undefined})}/>
                    <VisualizationFormatOptions type={metadata?.type} format={column.format} onChange={format => update({...column, format})}/>
                </>}
            </div>;
        })}
        <label className={cn('grid gap-1 text-xs')}>Filas por página<Input type="number" min={10} max={100} value={chart.pageSize ?? 25} onChange={event => onChange({...chart, pageSize: Number(event.target.value)})}/></label>
    </div>;
}
