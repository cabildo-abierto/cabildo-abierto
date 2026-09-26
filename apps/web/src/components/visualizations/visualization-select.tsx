import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {cn} from '@/lib/utils';
export function VisualizationSelect({label, value, options, onChange, optional = false, prominent = false}: {label: string; value: string; options: {value: string; label: string}[]; onChange: (value: string) => void; optional?: boolean; prominent?: boolean}) {
    const selected = options.find(option => option.value === value);
    return <label className={cn('grid min-w-0 gap-1 text-xs text-muted-foreground')}><span>{label}</span>
        <Select value={value || '__none__'} onValueChange={value => { if (value) onChange(value === '__none__' ? '' : value); }}>
            <SelectTrigger className={cn('w-full min-w-0')} aria-label={label}><SelectValue className={cn('min-w-0')}><span className={cn('truncate',prominent && 'font-semibold text-foreground')} title={selected?.label ?? value}>{selected?.label ?? (value || 'Elegir…')}</span></SelectValue></SelectTrigger>
            <SelectContent data-attachment-editor-popup>{optional && <SelectItem value="__none__">Ninguno</SelectItem>}{options.map(option => <SelectItem key={option.value} value={option.value}><span className={cn('max-w-[calc(var(--anchor-width)-3rem)] truncate')} title={option.label}>{option.label}</span></SelectItem>)}</SelectContent>
        </Select>
    </label>;
}
