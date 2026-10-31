import express from 'express';
import {randomUUID} from 'node:crypto';
import {sql} from 'kysely';
import type {AppContext} from '#/setup.js';
import {createApiRouter} from '../../openapi/router.js';
import type {ErrorResponder} from '../../openapi/handler.js';
import {requireSession, requiredUser} from '#/auth/middleware.js';
import {requireTopicAccess} from '#/services/topic-access.js';
import {TopicActionError} from '#/services/topic-title-edits.js';

export function topicMemberRoutes(ctx: AppContext): express.Router {
    const router = express.Router();
    const api = createApiRouter(router);
    const fail = (res: ErrorResponder, error: unknown) => {
        if (error instanceof TopicActionError) return res.status(error.status).json({success: false, error: error.message});
        ctx.logger.pino.error({error}, 'topic membership action failed');
        return res.status(500).json({success: false, error: 'No pudimos actualizar el acceso al tema.'});
    };
    api.get('/topics/:id/members', requireSession(ctx), async (req, res) => {
        try {
            await requireTopicAccess(ctx.kysely, req.params.id, true);
            const members = await ctx.kysely.selectFrom('topic_member').innerJoin('user', 'user.id', 'topic_member.user_id')
                .select(['user.id', 'user.username', 'topic_member.role']).where('topic_id', '=', req.params.id).orderBy('user.username').execute();
            const invitations = await ctx.kysely.selectFrom('topic_invitation').innerJoin('user', 'user.id', 'topic_invitation.recipient_id')
                .select(['topic_invitation.id', 'user.id as userId', 'user.username', 'role', 'status', 'created_at'])
                .where('topic_id', '=', req.params.id).where('status', '=', 'pending').orderBy('created_at', 'desc').execute();
            return res.json({success: true, value: {members: members.map(m => ({user: {id: m.id, username: m.username}, role: m.role})),
                invitations: invitations.map(i => ({id: i.id, recipient: {id: i.userId, username: i.username}, role: i.role, status: i.status, createdAt: i.created_at.toISOString()}))}});
        } catch (error) { return fail(res, error); }
    });
    const changeMember = async (topicId: string, userId: string, role: 'admin' | 'member' | null) => {
        await ctx.kysely.transaction().execute(async trx => {
            await trx.selectFrom('topic').select('id').where('id', '=', topicId).forUpdate().execute();
            await requireTopicAccess(trx, topicId, true);
            const member = await trx.selectFrom('topic_member').select('role').where('topic_id', '=', topicId).where('user_id', '=', userId).executeTakeFirst();
            if (!member) throw new TopicActionError(404, 'No encontramos ese miembro.');
            if (member.role === 'admin' && role !== 'admin') {
                const admins = await trx.selectFrom('topic_member').select('user_id').where('topic_id', '=', topicId).where('role', '=', 'admin').execute();
                if (admins.length === 1) throw new TopicActionError(409, 'El tema debe conservar al menos un administrador.');
            }
            if (role === null) {
                await trx.deleteFrom('topic_member').where('topic_id', '=', topicId).where('user_id', '=', userId).execute();
                await trx.deleteFrom('topic_connection').where('topic_id', '=', topicId).where('viewer_id', '=', `user:${userId}`).execute();
                await sql`select pg_notify('topic_realtime', ${JSON.stringify({type: 'access.changed', topicId, userId})})`.execute(trx);
            } else if (role) await trx.updateTable('topic_member').set({role}).where('topic_id', '=', topicId).where('user_id', '=', userId).execute();
        });
    };
    api.patch('/topics/:id/members/:userId', requireSession(ctx), async (req, res) => {
        try { await changeMember(req.params.id, req.params.userId, req.body.role); return res.json({success: true}); }
        catch (error) { return fail(res, error); }
    });
    api.delete('/topics/:id/members/:userId', requireSession(ctx), async (req, res) => {
        try { await changeMember(req.params.id, req.params.userId, null); return res.json({success: true}); }
        catch (error) { return fail(res, error); }
    });
    api.get('/topics/:id/invitations/candidates', requireSession(ctx), async (req, res) => {
        try {
            await requireTopicAccess(ctx.kysely, req.params.id, true);
            const search = req.query.q.toLowerCase();
            const users = await ctx.kysely.selectFrom('user').select(['user.id', 'user.username'])
                .where(sql<boolean>`strpos(lower(username), ${search}) > 0`)
                .where(eb => eb.not(eb.exists(eb.selectFrom('topic_member').select('user_id')
                    .whereRef('topic_member.user_id', '=', 'user.id').where('topic_id', '=', req.params.id))))
                .where(eb => eb.not(eb.exists(eb.selectFrom('topic_invitation').select('id')
                    .whereRef('topic_invitation.recipient_id', '=', 'user.id').where('topic_id', '=', req.params.id).where('status', '=', 'pending'))))
                .orderBy(sql<number>`CASE WHEN lower(username) = ${search} THEN 0 WHEN starts_with(lower(username), ${search}) THEN 1 ELSE 2 END`)
                .orderBy('user.username').limit(10).execute();
            return res.json({success: true, value: {users}});
        } catch (error) { return fail(res, error); }
    });
    api.post('/topics/:id/invitations', requireSession(ctx), async (req, res) => {
        try {
            const value = await ctx.kysely.transaction().execute(async trx => {
                await trx.selectFrom('topic').select('id').where('id', '=', req.params.id).forUpdate().execute();
                await requireTopicAccess(trx, req.params.id, true);
                const user = await trx.selectFrom('user').select(['id', 'username']).where(sql<boolean>`lower(username) = lower(${req.body.username.trim()})`).executeTakeFirst();
                if (!user) throw new TopicActionError(404, 'No encontramos una cuenta con ese nombre.');
                const member = await trx.selectFrom('topic_member').select('user_id').where('topic_id', '=', req.params.id).where('user_id', '=', user.id).executeTakeFirst();
                if (member) throw new TopicActionError(409, 'Esta persona ya tiene acceso.');
                let invitation = await trx.selectFrom('topic_invitation').selectAll().where('topic_id', '=', req.params.id).where('recipient_id', '=', user.id).where('status', '=', 'pending').executeTakeFirst();
                if (!invitation) {
                    invitation = await trx.insertInto('topic_invitation').values({id: randomUUID(), topic_id: req.params.id, recipient_id: user.id,
                        inviter_id: requiredUser(req).id, role: req.body.role, resolved_at: null}).returningAll().executeTakeFirstOrThrow();
                    await trx.insertInto('notification').values({id: randomUUID(), recipient_id: user.id, actor_id: requiredUser(req).id,
                        kind: 'topic_invitation', source_id: invitation.id, target_id: invitation.id, invitation_id: invitation.id,
                        topic_id: req.params.id, block_number: null, document_block_id: null, read_at: null}).execute();
                }
                return {id: invitation.id, recipient: user, role: invitation.role, status: invitation.status, createdAt: invitation.created_at.toISOString()};
            });
            return res.status(201).json({success: true, value});
        } catch (error) { return fail(res, error); }
    });
    api.delete('/topics/:id/invitations/:invitationId', requireSession(ctx), async (req, res) => {
        try {
            await ctx.kysely.transaction().execute(async trx => {
                await trx.selectFrom('topic').select('id').where('id', '=', req.params.id).forUpdate().execute();
                await requireTopicAccess(trx, req.params.id, true);
                const updated = await trx.updateTable('topic_invitation').set({status: 'cancelled', resolved_at: new Date()})
                    .where('id', '=', req.params.invitationId).where('topic_id', '=', req.params.id).where('status', '=', 'pending').returning('id').executeTakeFirst();
                if (!updated) throw new TopicActionError(404, 'No encontramos esa invitación pendiente.');
            });
            return res.json({success: true});
        } catch (error) { return fail(res, error); }
    });
    for (const action of ['accept', 'decline'] as const) api.post(`/topics/:id/invitations/:invitationId/${action}`, requireSession(ctx), async (req, res) => {
        try {
            await ctx.kysely.transaction().execute(async trx => {
                await trx.selectFrom('topic').select('id').where('id', '=', req.params.id).forUpdate().execute();
                const invitation = await trx.selectFrom('topic_invitation').selectAll().where('id', '=', req.params.invitationId)
                    .where('topic_id', '=', req.params.id).where('recipient_id', '=', requiredUser(req).id).forUpdate().executeTakeFirst();
                if (!invitation) throw new TopicActionError(404, 'No encontramos esa invitación.');
                if (invitation.status !== 'pending') throw new TopicActionError(409, 'Esta invitación ya no está pendiente.');
                if (action === 'accept') await trx.insertInto('topic_member').values({topic_id: req.params.id, user_id: requiredUser(req).id, role: invitation.role})
                    .onConflict(c => c.columns(['topic_id', 'user_id']).doNothing()).execute();
                await trx.updateTable('topic_invitation').set({status: action === 'accept' ? 'accepted' : 'declined', resolved_at: new Date()}).where('id', '=', invitation.id).execute();
                await trx.updateTable('notification').set({read_at: new Date()}).where('invitation_id', '=', invitation.id).execute();
            });
            return res.json({success: true});
        } catch (error) { return fail(res, error); }
    });
    return router;
}
