"use client";
import {GlobeHemisphereWestIcon, LockSimpleIcon} from '@phosphor-icons/react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {cn} from '@/lib/utils';

const options = [
    {value: 'public', label: 'Público', Icon: GlobeHemisphereWestIcon, description: 'Cualquier persona puede ver y participar en el tema.'},
    {value: 'private', label: 'Privado', Icon: LockSimpleIcon, description: 'Solo las personas invitadas pueden ver y participar en el tema.'},
] as const;

export function TopicPrivacyField({value, onChange}: {value: boolean; onChange: (value: boolean) => void}) {
    const selected = options[value ? 1 : 0];
    return <Select value={selected.value} onValueChange={visibility => { if (visibility) onChange(visibility === 'private'); }}>
        <SelectTrigger aria-label="Visibilidad del tema" className={cn('h-9 gap-2 self-start px-3 text-xs')}>
            <SelectValue><selected.Icon aria-hidden="true"/>{selected.label}</SelectValue>
        </SelectTrigger>
        <SelectContent align="start" alignItemWithTrigger={false} className={cn('w-80 max-w-[calc(100vw-2rem)] p-1')}>
            {options.map(({value: visibility, label, Icon, description}) => <SelectItem key={visibility} value={visibility} label={label} className={cn('items-start py-2 pr-7')}>
                <Icon aria-hidden="true" className={cn('mt-0.5 text-muted-foreground')}/>
                <span className={cn('flex min-w-0 flex-col gap-1 whitespace-normal')}>
                    <span className={cn('text-sm font-medium')}>{label}</span>
                    <span className={cn('text-xs leading-snug text-muted-foreground')}>{description}</span>
                </span>
            </SelectItem>)}
        </SelectContent>
    </Select>;
}
