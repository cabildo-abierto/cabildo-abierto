"use client";

import {useId, useState, type FormEvent} from 'react';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {KeyIcon, TrashIcon} from '@phosphor-icons/react';
import type {ApiTokenListOutput, CreatedApiToken, CreateApiTokenInput} from '@cabildo-abierto/api';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Spinner} from '@/components/ui/spinner';
import {del, get, post} from '@/utils/react/fetch';
import {cn} from '@/lib/utils';
import {ReferenceDisclosure} from './reference-disclosure';
import {ApiTokenSecret} from './api-token-secret';

export function ApiTokenManager({userId}: {userId: string}) {
    const formId = useId();
    const client = useQueryClient();
    const queryKey = ['auth', 'api-tokens', userId];
    const [name, setName] = useState('Nuevo token');
    const [expiresInDays, setExpiresInDays] = useState('30');
    const [created, setCreated] = useState<CreatedApiToken | null>(null);
    const [pending, setPending] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const tokens = useQuery({queryKey, retry: false, queryFn: async () => {
        const result = await get<ApiTokenListOutput>('/auth/tokens');
        if ('error' in result) throw new Error(result.error);
        return result.value;
    }});

    async function generate(event: FormEvent) {
        event.preventDefault();
        if (pending || created || !name.trim()) return;
        setPending('create');
        setError(null);
        try {
            const result = await post<CreateApiTokenInput, CreatedApiToken>('/auth/tokens', {name: name.trim(), expiresInDays: Number(expiresInDays)});
            if ('error' in result) throw new Error(result.error);
            const {token, ...metadata} = result.value;
            setCreated({...metadata, token});
            client.setQueryData<ApiTokenListOutput>(queryKey, current => ({tokens: [metadata, ...(current?.tokens ?? [])]}));
            void client.invalidateQueries({queryKey, exact: true});
        } catch (error) { setError(error instanceof Error ? error.message : 'No pudimos generar el token.'); }
        finally { setPending(null); }
    }

    async function revoke(id: string) {
        if (pending) return;
        setPending(id);
        setError(null);
        try {
            const result = await del(`/auth/tokens/${encodeURIComponent(id)}`);
            if ('error' in result) throw new Error(result.error);
            setCreated(current => current?.id === id ? null : current);
            client.setQueryData<ApiTokenListOutput>(queryKey, current => ({tokens: (current?.tokens ?? []).filter(token => token.id !== id)}));
            void client.invalidateQueries({queryKey, exact: true});
        } catch (error) { setError(error instanceof Error ? error.message : 'No pudimos revocar el token.'); }
        finally { setPending(null); }
    }

    return <><ReferenceDisclosure title="Tokens para la API" defaultOpen className={cn('rounded-lg border border-border bg-muted/35 p-4')}>
        <div className={cn('space-y-4')}>
            <p className={cn('text-xs leading-5 text-muted-foreground')}>Obtené un token para usar la API con tu cuenta.</p>
            <form onSubmit={event => void generate(event)} className={cn('flex flex-wrap items-end gap-3')}>
                <div className={cn('grid min-w-48 flex-1 gap-2')}><Label htmlFor={`${formId}-name`}>Nombre</Label>
                    <Input id={`${formId}-name`} value={name} maxLength={80} required disabled={!!pending || !!created} onChange={event => setName(event.target.value)} placeholder="Nuevo token"/>
                </div>
                <div className={cn('grid gap-2')}><Label htmlFor={`${formId}-expires`}>Vencimiento</Label>
                    <Select value={expiresInDays} onValueChange={value => { if (value) setExpiresInDays(value); }} disabled={!!pending || !!created}>
                        <SelectTrigger id={`${formId}-expires`}><SelectValue>{expiresInDays} días</SelectValue></SelectTrigger>
                        <SelectContent>{['7', '30', '90'].map(days => <SelectItem key={days} value={days}>{days} días</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <Button type="submit" size="sm" disabled={!!pending || !!created || !name.trim()}>{pending === 'create' ? <Spinner/> : <KeyIcon/>}Generar token</Button>
            </form>
            {error && <p role="alert" className={cn('text-xs text-destructive')}>{error}</p>}
            {tokens.isPending ? <div role="status" className={cn('flex items-center gap-2 text-xs text-muted-foreground')}><Spinner/>Cargando tus tokens…</div>
                : tokens.isError ? <div className={cn('flex flex-wrap items-center gap-2')}><p role="alert" className={cn('text-xs text-destructive')}>{tokens.error.message}</p>
                    <Button type="button" variant="ghost" size="sm" onClick={() => void tokens.refetch()}>Reintentar</Button></div>
                : tokens.data.tokens.length > 0 && <ul className={cn('divide-y divide-border border-t border-border')}>
                    {tokens.data.tokens.map(token => <li key={token.id} className={cn('flex items-center justify-between gap-3 py-3')}>
                        <div className={cn('min-w-0 space-y-1')}><p className={cn('truncate text-xs font-medium')}>{token.name}</p>
                            <p className={cn('text-[11px] text-muted-foreground')}><code>{token.prefix}…</code> · {new Date(token.expiresAt).getTime() <= Date.now() ? 'Vencido el' : 'Vence el'} {new Date(token.expiresAt).toLocaleDateString('es-AR')}</p>
                        </div>
                        <Button type="button" variant="ghost" size="sm" disabled={!!pending} aria-label={`Revocar ${token.name}`} onClick={() => void revoke(token.id)}>
                            {pending === token.id ? <Spinner/> : <TrashIcon/>}Revocar
                        </Button>
                    </li>)}
                </ul>}
        </div>
    </ReferenceDisclosure>
        {created && <ApiTokenSecret key={created.id} value={created} onDismiss={() => setCreated(null)}/>}
    </>;
}
