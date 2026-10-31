import {Router, type ErrorRequestHandler} from 'express';
import {rateLimit} from 'express-rate-limit';
import type {AppContext} from '#/setup.js';
import {PostgresRateLimitStore} from './postgres-rate-limit-store.js';

type RateLimitOptions = {
    requestsPerMinute: number;
    authAttemptsPerQuarterHour: number;
    tokensPerHour: number;
};

export function createApiRateLimits(ctx: AppContext, options: RateLimitOptions) {
    const router = Router();
    const limiter = (policy: string, windowMs: number, limit: number) => rateLimit({
        windowMs,
        limit,
        identifier: policy,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        ipv6Subnet: 56,
        store: new PostgresRateLimitStore(ctx.kysely, policy, windowMs),
        skip: req => req.method === 'OPTIONS' || req.path === '/healthz',
        handler: (_req, res) => {
            res.setHeader('Cache-Control', 'no-store');
            res.status(429).json({success: false, error: 'Demasiadas solicitudes. Esperá el tiempo indicado en Retry-After antes de reintentar.'});
        },
    });

    router.use(limiter('api', 60_000, options.requestsPerMinute));
    // Register these before parsing and validating bodies so invalid attempts also count.
    router.post(['/auth/login', '/auth/register'], limiter('auth', 15 * 60_000, options.authAttemptsPerQuarterHour));
    router.post('/auth/tokens', limiter('token-creation', 60 * 60_000, options.tokensPerHour));
    const handleStoreError: ErrorRequestHandler = (error, _req, res, _next) => {
        ctx.logger.pino.error({error}, 'rate limit store failed');
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Retry-After', '5');
        res.status(503).json({success: false, error: 'El servicio no está disponible. Reintentá en unos segundos.'});
    };
    router.use(handleStoreError);
    return router;
}
