"use client";
import Link from 'next/link';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import type {Notification} from '@cabildo-abierto/api';
import {Button} from '@/components/ui/button';
import {post} from '@/utils/react/fetch';
import {cn} from '@/lib/utils';
import {NotificationIcon} from './notification-icon';
import {formatRelativeDate} from './topic-block-date';

export function TopicInvitationNotification({item}: {item: Notification}) {
    const client = useQueryClient();
    const invitation = item.invitation;
    const mutation = useMutation({mutationFn: async (action: 'accept' | 'decline') => {
        const result = await post(`/topics/${encodeURIComponent(item.topic.id)}/invitations/${invitation!.id}/${action}`);
        if ('error' in result) throw new Error(result.error);
    }, onSuccess: async () => { await Promise.all([client.invalidateQueries({queryKey: ['notifications']}), client.invalidateQueries({queryKey: ['topics']})]); }});
    if (!invitation) return null;
    const status = invitation.status;
    return <div className={cn('space-y-3 rounded-lg border p-3.5', !item.readAt && 'border-primary/30 bg-primary/5')}>
        <div className={cn('flex gap-2.5')}>
            <NotificationIcon kind={item.kind}/>
            <div className={cn('min-w-0 space-y-1')}>
                <p className={cn('text-sm font-medium leading-snug')}>{item.actor.username} te invitó al tema {item.topic.title}</p>
                <p className={cn('text-xs text-muted-foreground')}>{invitation.role === 'admin' ? 'Como administrador' : 'Como miembro'} · {formatRelativeDate(item.createdAt)}</p>
            </div>
        </div>
        {status === 'pending' ? <div className={cn('flex gap-2')}>
            <Button size="sm" disabled={mutation.isPending} onClick={() => mutation.mutate('accept')}>Aceptar</Button>
            <Button size="sm" variant="outline" disabled={mutation.isPending} onClick={() => mutation.mutate('decline')}>Rechazar</Button>
        </div> : <p className={cn('text-xs text-muted-foreground')}>{status === 'accepted' ? 'Invitación aceptada' : status === 'declined' ? 'Invitación rechazada' : 'Invitación cancelada'}</p>}
        {status === 'accepted' && <Button size="sm" variant="outline" nativeButton={false} render={<Link href={`/tema/${encodeURIComponent(item.topic.slug)}`}/>}>Ir al tema</Button>}
        {mutation.error && <p role="alert" className={cn('text-sm text-destructive')}>{mutation.error.message}</p>}
    </div>;
}
