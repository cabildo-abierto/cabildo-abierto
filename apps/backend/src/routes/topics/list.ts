import type {AppContext} from '#/setup.js';
import {listTopics} from '#/services/topics/list.js';
import {createApiRouter} from '../../openapi/router.js';

export function topicListRoutes(ctx: AppContext) {
    const api = createApiRouter();
    api.get('/topics', async (req, res) => {
        try {
            const value = await listTopics(ctx.kysely, req.query);
            return res.json({success: true, value});
        } catch (error) {
            ctx.logger.pino.error({error}, 'topic listing failed');
            return res.status(500).json({success: false, error: 'No pudimos buscar los temas.'});
        }
    });
    return api.router;
}
