import {z} from 'zod';
import {publicUserSchema} from './auth';
import {topicSummarySchema} from './topics';
import {actionErrors, emptyValueSuccess, idParams, sessionSecurity, successResponse, type ApiContract} from './common';

export const notificationSchema = z.object({
    id: z.string(), kind: z.enum(['comment', 'reply', 'replica', 'rejection', 'positive_vote', 'edit']), sourceId: z.string(),
    actor: publicUserSchema, topic: topicSummarySchema, targetId: z.string(), blockNumber: z.string().nullable(),
    documentBlockId: z.string().nullable(), targetDeleted: z.boolean(), replicaToReplica: z.boolean(), createdAt: z.string(), readAt: z.string().nullable(),
}).meta({id: 'Notification'});
export const notificationsOutputSchema = z.object({notifications: z.array(notificationSchema), nextCursor: z.string().nullable(), unreadCount: z.number()});
export const notificationCountSchema = z.object({unreadCount: z.number()});
export const notificationsContract = {
    '/notifications': {get: {operationId: 'getNotifications', summary: 'Listar notificaciones', tags: ['Notificaciones'], security: sessionSecurity,
        requestParams: {query: z.object({cursor: z.string().optional()})}, responses: {...actionErrors, '200': successResponse(notificationsOutputSchema, 'Página de hasta 30 notificaciones.')}}},
    '/notifications/count': {get: {operationId: 'getNotificationCount', summary: 'Contar notificaciones sin leer', tags: ['Notificaciones'], security: sessionSecurity,
        responses: {...actionErrors, '200': successResponse(notificationCountSchema, 'Cantidad de notificaciones sin leer.')}}},
    '/notifications/read-all': {patch: {operationId: 'readAllNotifications', summary: 'Marcar todas las notificaciones como leídas', tags: ['Notificaciones'], security: sessionSecurity,
        responses: {...actionErrors, '200': emptyValueSuccess}}},
    '/notifications/:id/read': {patch: {operationId: 'readNotification', summary: 'Marcar una notificación como leída', tags: ['Notificaciones'], security: sessionSecurity,
        requestParams: {path: idParams}, responses: {...actionErrors, '200': emptyValueSuccess}}},
} satisfies ApiContract;

export type Notification = z.output<typeof notificationSchema>;
export type NotificationsOutput = z.output<typeof notificationsOutputSchema>;
export type NotificationCountOutput = z.output<typeof notificationCountSchema>;
