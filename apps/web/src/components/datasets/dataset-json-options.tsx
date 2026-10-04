import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {cn} from '@/lib/utils';

export function DatasetJSONOptions({filter, onChange}: {filter: string | null; onChange: (filter: string | null) => void}) {
    const [expanded, setExpanded] = useState(!!filter);
    return <div className={cn('space-y-2')}>
        <Button type="button" variant="ghost" size="xs" aria-expanded={expanded} onClick={() => {setExpanded(!expanded); if (expanded) onChange(null);}}>Transformar JSON con jq</Button>
        {expanded && <>
            <Textarea aria-label="Transformación jq" className={cn('min-h-32 font-mono text-xs')} value={filter ?? ''} maxLength={20000}
                placeholder={'[.items[] | {nombre: .name, valor: (.value | tonumber)}]'} onChange={event => onChange(event.target.value)}/>
            <p className={cn('text-xs text-muted-foreground')}>Los conjuntos de datos JSON tienen que ser una lista de objetos, cada uno representando una fila. Podés usar <b>jq</b> para transformar los datos.</p>
        </>}
    </div>;
}
