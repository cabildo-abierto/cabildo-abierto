"use client";
import {TopicRoleSelect as RoleSelect} from './topic-role-select';
import {useEffect, useRef, useState, type FormEvent} from 'react';
import {Dialog} from '@base-ui/react/dialog';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import type {TopicAccess, TopicRole, TopicSummary} from '@cabildo-abierto/api';
import {UsersIcon, UserMinusIcon, XIcon} from '@phosphor-icons/react';
import {Button} from '@/components/ui/button';
import {TopicInvitationUserSearch} from './topic-invitation-user-search';
import {ScrollArea} from '@/components/ui/scroll-area';
import {useToast} from '@/components/ui/toast';
import {get, post, patch, del} from '@/utils/react/fetch';
import {cn} from '@/lib/utils';

export function TopicAccessDialog({topic}: {topic: TopicSummary}) {
    const [open, setOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [role, setRole] = useState<TopicRole>('member');
    const client = useQueryClient();
    const {toast} = useToast();
    const base = `/topics/${encodeURIComponent(topic.id)}`;
    const access = useQuery({queryKey: ['topic-access', topic.id], enabled: open,
        queryFn: async () => { const result = await get<TopicAccess>(`${base}/members`); if ('error' in result) throw new Error(result.error); return result.value; }});
    const lastErrorAt = useRef(0);
    useEffect(() => {
        if (!open || !access.error || lastErrorAt.current === access.errorUpdatedAt) return;
        lastErrorAt.current = access.errorUpdatedAt;
        toast({title: access.error.message, variant: 'destructive'});
    }, [open, access.error, access.errorUpdatedAt, toast]);
    const mutation = useMutation({mutationFn: async ({path, method, body}: {path: string; method: 'post' | 'patch' | 'delete'; body?: unknown}) => {
        const result = method === 'post' ? await post(base + path, body) : method === 'patch' ? await patch(base + path, body) : await del(base + path);
        if ('error' in result) throw new Error(result.error);
    }, onError: error => toast({title: error.message, variant: 'destructive'}), onSuccess: async (_result, variables) => {
        if (variables.path === '/invitations' && variables.method === 'post') {
            setUsername('');
            toast({title: 'Invitación enviada'});
        }
        await client.invalidateQueries({queryKey: ['topic-access', topic.id]});
        await client.invalidateQueries({queryKey: ['topic-invitation-candidates', topic.id]});
        await client.invalidateQueries({queryKey: ['topic', topic.id]});
    }});
    const invite = (event: FormEvent) => { event.preventDefault(); mutation.mutate({path: '/invitations', method: 'post', body: {username, role}}); };
    return <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger render={<Button variant="outline" size="sm"/>}><UsersIcon/>Accesos</Dialog.Trigger>
        <Dialog.Portal>
            <Dialog.Backdrop className={cn('fixed inset-0 z-50 bg-black/40')}/>
            <Dialog.Popup className={cn('fixed left-1/2 top-1/2 z-50 flex max-h-[85dvh] w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl border bg-background p-5 shadow-lg')}>
                <div className={cn('mb-4 flex items-center justify-between gap-2')}>
                    <Dialog.Title className={cn('font-semibold')}>Accesos al tema</Dialog.Title>
                    <Dialog.Close render={<Button variant="ghost" size="icon-sm" aria-label="Cerrar"/>}><XIcon/></Dialog.Close>
                </div>
                <Dialog.Description className={cn('mb-4 text-sm text-muted-foreground')}>Los miembros pueden leer, editar y participar. Los administradores también gestionan los accesos.</Dialog.Description>
                <section aria-labelledby="topic-invite-heading" className={cn('mb-4 border-b border-border pb-4')}>
                    <h3 id="topic-invite-heading" className={cn('mb-2 text-sm font-medium')}>Invitar usuario</h3>
                    <form onSubmit={invite} className={cn('flex flex-wrap gap-2')}>
                        <TopicInvitationUserSearch topicId={topic.id} value={username} onChange={setUsername} disabled={mutation.isPending}/>
                        <RoleSelect value={role} onChange={setRole}/>
                        <Button type="submit" disabled={mutation.isPending || !username.trim()}>
                            {mutation.isPending && mutation.variables?.path === '/invitations' ? 'Invitando…' : 'Invitar'}
                        </Button>
                    </form>
                </section>
                <h3 className={cn('mb-3 text-sm font-medium')}>Miembros</h3>
                <ScrollArea className={cn('min-h-0 flex-1')} viewportClassName={cn('max-h-[40dvh]')}>
                    <div className={cn('space-y-3 pr-2')}>
                        {access.isPending && <p className={cn('text-sm text-muted-foreground')}>Cargando accesos…</p>}
                        {access.data?.members.map(member => <div key={member.user.id} className={cn('flex flex-wrap items-center gap-2')}>
                            <span className={cn('min-w-20 flex-1 truncate text-sm')}>{member.user.username}</span>
                            <RoleSelect value={member.role} disabled={mutation.isPending} onChange={newRole => mutation.mutate({path: `/members/${encodeURIComponent(member.user.id)}`, method: 'patch', body: {role: newRole}})}/>
                            <Button variant="outline" size="icon" className={cn('border-input bg-input/20 transition-colors hover:bg-input/20 dark:bg-input/30 dark:hover:bg-input/50')} aria-label={`Quitar acceso a ${member.user.username}`} title="Quitar acceso" disabled={mutation.isPending} onClick={() => mutation.mutate({path: `/members/${encodeURIComponent(member.user.id)}`, method: 'delete'})}><UserMinusIcon aria-hidden="true"/></Button>
                        </div>)}
                        {!!access.data?.invitations.length && <h3 className={cn('pt-3 text-sm font-medium')}>Invitaciones pendientes</h3>}
                        {access.data?.invitations.map(invitation => <div key={invitation.id} className={cn('flex items-center gap-2 text-sm')}>
                            <span className={cn('min-w-0 flex-1 truncate')}>{invitation.recipient.username} <span className={cn('text-muted-foreground')}>· {invitation.role === 'admin' ? 'Administrador' : 'Miembro'}</span></span>
                            <Button variant="ghost" size="sm" disabled={mutation.isPending} onClick={() => mutation.mutate({path: `/invitations/${invitation.id}`, method: 'delete'})}>Cancelar</Button>
                        </div>)}
                    </div>
                </ScrollArea>
            </Dialog.Popup>
        </Dialog.Portal>
    </Dialog.Root>;
}
