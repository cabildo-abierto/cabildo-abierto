import express, {type Request, type Response} from "express";
import {sql} from "kysely";
import type {DocumentFormat, DocumentOutput} from "@cabildo-abierto/api";
import type {AppContext} from "#/setup.js";
import {currentUser, requireSession, requiredUser, withSession} from "#/auth/middleware.js";
import {TopicActionError} from "#/services/topic-title-edits.js";
import {R2Storage, type ObjectStorage} from "#/services/storage/storage.js";
import {requireDocumentAccess, requireDocumentFileAccess} from "#/services/documents/access.js";
import {uploadDocument} from "#/services/documents/upload.js";
import {convertOfficeFile} from "#/services/documents/conversion.js";
import {deleteDiscussionComment, discussionComments, mutateDiscussion, publishDiscussionComment, type DiscussionTarget} from "#/services/discussions.js";

export function documentRoutes(ctx: AppContext) {
    const router = express.Router();
    let storage: ObjectStorage | undefined;
    const getStorage = () => storage ??= new R2Storage();
    const fail = (res: Response, error: unknown) => {
        if (error instanceof TopicActionError) return res.status(error.status).json({success: false, error: error.message});
        ctx.logger.pino.error({error}, 'document request failed');
        return res.status(500).json({success: false, error: 'No pudimos completar la operación del documento.'});
    };
    router.post('/topics/:id/documents', requireSession(ctx), async (req, res) => {
        try {
            const uploaded = await uploadDocument(ctx, getStorage(), req, String(req.params.id), requiredUser(req).id);
            if (uploaded.format === 'office') {
                try { await convertOfficeFile(ctx, getStorage(), uploaded.id); }
                catch (error) {
                    if (!(error instanceof TopicActionError)) throw error;
                    await ctx.kysely.updateTable('file').set({preview_status: 'failed', preview_error: error.message}).where('id', '=', uploaded.id).execute();
                }
            }
            const result = await ctx.kysely.selectFrom('file').select('preview_error').where('id', '=', uploaded.id).executeTakeFirstOrThrow();
            return res.status(201).json({success: true, value: {fileId: uploaded.id, fileName: uploaded.fileName, previewError: result.preview_error}});
        } catch (error) { return fail(res, error); }
    });
    router.get('/document-files/:id', withSession(ctx), async (req, res) => {
        try {
            const file = await requireDocumentFileAccess(ctx.kysely, String(req.params.id), currentUser(req)?.id);
            return res.json({success: true, value: {fileId: file.id, fileName: file.name}});
        } catch (error) { return fail(res, error); }
    });
    router.get('/document-versions/:id', withSession(ctx), async (req, res) => {
        try {
            const doc = await requireDocumentAccess(ctx.kysely, String(req.params.id));
            const file = await ctx.kysely.selectFrom('file').selectAll().where('id', '=', doc.file_id).executeTakeFirstOrThrow();
            const topic = await ctx.kysely.selectFrom('topic').select(['id', 'title', 'slug']).where('id', '=', doc.topic_id).executeTakeFirstOrThrow();
            const blocks = await ctx.kysely.selectFrom('document_block').select(['id', 'type_id', 'content', sql<number>`(select count(*)::int from comment inner join record on record.id = comment.id where comment.document_block_id = document_block.id and comment.topic_id = ${doc.topic_id} and record.deleted = false and comment.reply_to_id = comment.root_id)`.as('commentCount')])
                .where('file_id', '=', doc.file_id).orderBy('position').execute();
            const text = doc.format === 'text' || doc.format === 'markdown' ? new TextDecoder().decode(await getStorage().read(file)) : null;
            const value: DocumentOutput = {id: doc.id, versionId: doc.id, title: doc.title, description: doc.description,
                topic, format: doc.format as DocumentFormat, fileName: file.name, size: file.size,
                previewStatus: doc.preview_status as DocumentOutput['previewStatus'], previewError: doc.preview_error,
                canRetry: currentUser(req)?.id === doc.author_id, text,
                blocks: blocks.map(block => ({id: block.id, typeId: block.type_id as 'parrafo' | 'h1' | 'h2', content: block.content, commentCount: block.commentCount}))};
            return res.json({success: true, value});
        } catch (error) { return fail(res, error); }
    });
    router.get('/documents/:id/file', withSession(ctx), async (req, res) => {
        try {
            const doc = await requireDocumentAccess(ctx.kysely, String(req.params.id));
            const preview = req.query.preview === 'true';
            const fileId = preview && doc.format === 'office' ? doc.preview_file_id : doc.file_id;
            if (!fileId) throw new TopicActionError(404, 'La vista previa todavía no está disponible.');
            const file = await ctx.kysely.selectFrom('file').selectAll().where('id', '=', fileId).executeTakeFirstOrThrow();
            const disposition = preview && file.mime === 'application/pdf' ? 'inline' : 'attachment';
            const url = await getStorage().signedUrl(file, `${disposition}; filename*=UTF-8''${encodeURIComponent(file.name).replace(/'/g, '%27')}`, file.mime);
            res.setHeader('Cache-Control', 'private, no-store');
            return res.redirect(url);
        } catch (error) { return fail(res, error); }
    });
    router.post('/documents/:id/preview', requireSession(ctx), async (req, res) => {
        try {
            const doc = await requireDocumentAccess(ctx.kysely, String(req.params.id));
            if (doc.author_id !== requiredUser(req).id) throw new TopicActionError(403, 'Solo el autor puede reintentar la conversión.');
            if (doc.format !== 'office') throw new TopicActionError(400, 'Este documento no requiere conversión.');
            await convertOfficeFile(ctx, getStorage(), doc.file_id);
            return res.json({success: true, value: {}});
        } catch (error) { return fail(res, error); }
    });
    const resolveBlock = async (req: Request): Promise<DiscussionTarget> => {
        const doc = await requireDocumentAccess(ctx.kysely, String(req.params.id));
        const block = await ctx.kysely.selectFrom('document_block').select('id').where('id', '=', String(req.params.blockId)).where('file_id', '=', doc.file_id).executeTakeFirst();
        if (!block) throw new TopicActionError(404, 'No encontramos ese bloque.');
        return {id: doc.edit_id, rootId: doc.edit_id, topicId: doc.topic_id, blockNumber: null, documentBlockId: block.id, kind: 'document'};
    };
    const path = '/documents/:id/blocks/:blockId/comments';
    router.get(path, withSession(ctx), async (req, res) => {
        try {
            const target = await resolveBlock(req);
            const comments = await discussionComments(ctx.kysely, target.topicId, {documentBlockId: target.documentBlockId!});
            return res.json({success: true, value: {comments}});
        } catch (error) { return fail(res, error); }
    });
    router.post(path, requireSession(ctx), async (req, res) => {
        try {
            const target = await resolveBlock(req);
            const comment = await mutateDiscussion(ctx.kysely, target, (trx, authorId) => publishDiscussionComment(trx, target, requiredUser(req), authorId, req.body ?? {}));
            return res.status(201).json({success: true, value: {comment}});
        } catch (error) { return fail(res, error); }
    });
    router.delete(`${path}/:commentId`, requireSession(ctx), async (req, res) => {
        try {
            const target = await resolveBlock(req);
            await mutateDiscussion(ctx.kysely, target, trx => deleteDiscussionComment(trx, target, String(req.params.commentId), requiredUser(req).id));
            return res.json({success: true, value: {}});
        } catch (error) { return fail(res, error); }
    });
    return router;
}
