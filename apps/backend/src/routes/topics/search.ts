import type {BlockType} from '@cabildo-abierto/api';
import type {AppContext} from '#/setup.js';
import {searchTopics} from '#/services/search/query.js';
import {createApiRouter} from '../../openapi/router.js';

export function topicSearchRoutes(ctx: AppContext) {
    const api = createApiRouter();
    api.get('/topics/search', async (req, res) => {
        try {
            const value = await searchTopics(ctx.kysely, {
                search: req.query.q.trim(),
                offset: req.query.offset, limit: req.query.limit,
                types: (req.query.types ? req.query.types.split(',') : []) as BlockType['id'][],
                history: req.query.history !== 'false', comments: req.query.comments !== 'false',
            });
            return res.json({success: true, value});
        } catch (error) {
            ctx.logger.pino.error({error}, 'topic search failed');
            return res.status(500).json({success: false, error: 'No pudimos buscar los temas.'});
        }
    });
    return api.router;
}
