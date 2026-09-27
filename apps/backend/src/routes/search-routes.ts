import express from 'express';
import type {BlockType} from '@cabildo-abierto/api';
import type {AppContext} from '#/setup.js';
import {searchContent} from '#/services/search/query.js';

const blockTypes: BlockType['id'][] = ['parrafo', 'h1', 'h2', 'imagen', 'documento', 'dataset', 'visualizacion'];

export function searchRoutes(ctx: AppContext) {
    const router = express.Router();
    router.get('/search', async (req, res) => {
        const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
        const offset = Number(req.query.offset ?? 0), limit = Number(req.query.limit ?? 20);
        const types = typeof req.query.types === 'string' && req.query.types ? req.query.types.split(',') : [];
        if (!q || q.length > 500 || !Number.isSafeInteger(offset) || offset < 0 || !Number.isInteger(limit) || limit < 1 || limit > 50
            || types.some(type => !blockTypes.includes(type as BlockType['id']))
            || (req.query.history !== undefined && !['true', 'false'].includes(String(req.query.history)))
            || (req.query.comments !== undefined && !['true', 'false'].includes(String(req.query.comments)))) {
            return res.status(400).json({success: false, error: 'La búsqueda o sus filtros no son válidos.'});
        }
        try {
            const value = await searchContent(ctx.kysely, {q, offset, limit, types: types as BlockType['id'][], history: req.query.history !== 'false', comments: req.query.comments !== 'false'});
            return res.json({success: true, value});
        } catch (error) {
            ctx.logger.pino.error({error}, 'content search failed');
            return res.status(500).json({success: false, error: 'No pudimos completar la búsqueda.'});
        }
    });
    return router;
}
