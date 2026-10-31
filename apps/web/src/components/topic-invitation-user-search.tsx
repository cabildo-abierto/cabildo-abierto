"use client";
import {useEffect, useRef} from 'react';
import {Autocomplete} from '@base-ui/react/autocomplete';
import {useQuery} from '@tanstack/react-query';
import type {TopicInvitationCandidates} from '@cabildo-abierto/api';
import {Input} from '@/components/ui/input';
import {useToast} from '@/components/ui/toast';
import {useDebouncedValue} from '@/hooks/use-debounced-value';
import {get} from '@/utils/react/fetch';
import {cn} from '@/lib/utils';

export function TopicInvitationUserSearch({topicId, value, onChange, disabled}: {
    topicId: string; value: string; onChange: (value: string) => void; disabled?: boolean;
}) {
    const search = value.trim().toLowerCase();
    const debounced = useDebouncedValue(search, 250);
    const {toast} = useToast();
    const lastErrorAt = useRef(0);
    const candidates = useQuery({
        queryKey: ['topic-invitation-candidates', topicId, debounced],
        enabled: !disabled && debounced.length >= 2 && debounced === search,
        retry: false,
        queryFn: async () => {
            const result = await get<TopicInvitationCandidates>(`/topics/${encodeURIComponent(topicId)}/invitations/candidates?${new URLSearchParams({q: debounced})}`);
            if ('error' in result) throw new Error(result.error);
            return result.value;
        },
    });
    useEffect(() => {
        if (!candidates.error || lastErrorAt.current === candidates.errorUpdatedAt) return;
        lastErrorAt.current = candidates.errorUpdatedAt;
        toast({title: candidates.error.message, variant: 'destructive'});
    }, [candidates.error, candidates.errorUpdatedAt, toast]);
    const current = debounced === search;
    const usernames = current ? candidates.data?.users.map(user => user.username) ?? [] : [];
    const loading = !current || candidates.isFetching;
    return <div className={cn('min-w-40 flex-1')}>
        <Autocomplete.Root items={usernames} value={value} onValueChange={onChange} mode="none" disabled={disabled}>
            <Autocomplete.Input render={<Input/>} placeholder="Buscar usuario…" aria-label="Buscar usuario para invitar" maxLength={30} required autoComplete="off"/>
            {search.length >= 2 && <Autocomplete.Portal>
                <Autocomplete.Positioner sideOffset={4} className={cn('z-[60]')}>
                    <Autocomplete.Popup className={cn('w-(--anchor-width) rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10')}>
                        {loading && <Autocomplete.Status className={cn('px-2 py-2 text-xs text-muted-foreground')}>Buscando…</Autocomplete.Status>}
                        <Autocomplete.Empty>
                            {!loading && !candidates.error && <p className={cn('px-2 py-2 text-xs text-muted-foreground')}>No encontramos usuarios para invitar.</p>}
                        </Autocomplete.Empty>
                        <Autocomplete.List className={cn('max-h-56 overflow-y-auto')}>
                            {(username: string) => <Autocomplete.Item key={username} value={username}
                                className={cn('cursor-default rounded-md px-2 py-1.5 text-xs outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground')}>
                                {username}
                            </Autocomplete.Item>}
                        </Autocomplete.List>
                    </Autocomplete.Popup>
                </Autocomplete.Positioner>
            </Autocomplete.Portal>}
        </Autocomplete.Root>
    </div>;
}
