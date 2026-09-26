import {useState} from 'react';
import {ArrowUpIcon, ArrowDownIcon, EyeIcon, EyeSlashIcon} from '@phosphor-icons/react';
import {Button} from '@/components/ui/button';
import {ScrollArea} from '@/components/ui/scroll-area';
import {cn} from '@/lib/utils';

export function DataViewColumns({columns, selected, onChange}: {columns: string[]; selected: string[]; onChange: (columns: string[]) => void}) {
    const visible = selected.length ? selected : columns;
    const [order,setOrder] = useState(() => [...visible,...columns.filter(name => !visible.includes(name))]);
    const available = new Set([...columns,...selected]);
    const ordered = [...order.filter(name => available.has(name)),...columns.filter(name => !order.includes(name))];
    return <fieldset className={cn('min-w-0 space-y-1')}>
        <legend className={cn('mb-2 text-xs font-medium')}>Columnas</legend>
        <ScrollArea className={cn('max-h-[600px]')} viewportClassName={cn('max-h-[600px] overscroll-contain')}>
        <div className={cn('space-y-1 pr-3')}>
        {ordered.map((name,i) => {
            const shown = visible.includes(name);
            const visibilityLabel = `${shown ? 'Ocultar' : 'Mostrar'} columna ${name}`;
            return <div key={name} className={cn('flex min-w-0 items-center gap-1 text-xs')}>
                <span className={cn('min-w-0 flex-1 truncate',!shown && 'text-muted-foreground')} title={name}>{name}</span>
                <Button type="button" variant="ghost" size="icon-xs" aria-label={visibilityLabel} title={visibilityLabel} aria-pressed={shown}
                    disabled={shown ? visible.length === 1 : visible.length >= 200}
                    onClick={() => onChange(ordered.filter(column => column === name ? !shown : visible.includes(column)))}>
                    {shown ? <EyeIcon/> : <EyeSlashIcon/>}
                </Button>
                {[{delta: -1, Icon: ArrowUpIcon, label: 'Subir'}, {delta: 1, Icon: ArrowDownIcon, label: 'Bajar'}].map(({delta,Icon,label}) => <Button key={delta} type="button" variant="ghost" size="icon-xs" disabled={i+delta < 0 || i+delta >= ordered.length} aria-label={`${label} columna ${name}`} title={`${label} columna ${name}`} onClick={() => {
                    const next = [...ordered];
                    [next[i],next[i+delta]] = [next[i+delta],next[i]];
                    setOrder(next);
                    onChange(next.filter(column => visible.includes(column)));
                }}><Icon/></Button>)}
            </div>;
        })}
        </div>
        </ScrollArea>
    </fieldset>;
}
