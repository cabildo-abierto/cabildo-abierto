"use client";
import {cn} from '@/lib/utils';
import type {TopicRole} from '@cabildo-abierto/api';
import {Select, SelectTrigger, SelectValue, SelectContent, SelectItem} from '@/components/ui/select';

export function TopicRoleSelect({value, onChange, disabled}: {value: TopicRole; onChange: (role: TopicRole) => void; disabled?: boolean}) {
    return <Select value={value} disabled={disabled} onValueChange={role => { if (role === 'admin' || role === 'member') onChange(role); }}>
        <SelectTrigger aria-label="Rol" className={cn('w-36 shrink-0')}><SelectValue>{value === 'admin' ? 'Administrador' : 'Miembro'}</SelectValue></SelectTrigger>
        <SelectContent><SelectItem value="member">Miembro</SelectItem><SelectItem value="admin">Administrador</SelectItem></SelectContent>
    </Select>;
}
