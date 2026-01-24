import {Agent, sessionAgent, SessionAgent} from "#/utils/session-agent.js";
import {AppContext} from "#/setup.js";
import express from "express";
import { SpanStatusCode } from '@opentelemetry/api';
import {env} from "#/lib/env.js";

export type CAHandlerOutput<Output> = Promise<{error?: string, data?: Output}>
export type CAHandler<Params={}, Output={}> = (ctx: AppContext, agent: SessionAgent, params: Params) => CAHandlerOutput<Output>
export type CAHandlerNoAuth<Params={}, Output={}> = (ctx: AppContext, agent: Agent, params: Params) => CAHandlerOutput<Output>


export function makeHandler<Params={}, Output={}>(ctx: AppContext, fn: CAHandler<Params, Output>): express.Handler {
    return async (req, res) => {
        const routePath = req.route?.path || req.path;
        const spanName = `${req.method} ${routePath}`;

        return ctx.tracer.startActiveSpan(spanName, async (span) => {
            try {
                span.setAttribute('http.method', req.method);
                span.setAttribute('http.route', routePath);
                span.setAttribute('http.target', req.url);

                const params = {...req.body, params: req.params, query: req.query} as Params;
                const agent = await sessionAgent(req, res, ctx);

                if(agent.hasSession()) {
                    span.setAttribute('auth.authenticated', true);
                    span.setAttribute('auth.did', agent.did);

                    const json = await fn(ctx, agent, params);

                    if (json.error) {
                        span.setAttribute('response.error', json.error);
                        span.setStatus({ code: SpanStatusCode.ERROR, message: json.error });
                    } else {
                        span.setStatus({ code: SpanStatusCode.OK });
                    }

                    return res.json(json);
                } else {
                    span.setAttribute('auth.authenticated', false);
                    span.setStatus({ code: SpanStatusCode.ERROR, message: 'Unauthorized' });
                    return res.json({error: "Unauthorized"});
                }
            } catch (error) {
                span.recordException(error as Error);
                span.setStatus({
                    code: SpanStatusCode.ERROR,
                    message: (error as Error).message
                });
                // Re-throw to let Express error handling deal with it
                throw error;
            } finally {
                span.end();
            }
        });
    };
}


export function makeHandlerNoAuth<Params={}, Output={}>(ctx: AppContext, fn: CAHandlerNoAuth<Params, Output>): express.Handler {
    return async (req, res) => {
        const routePath = req.route?.path || req.path;
        const spanName = `${req.method} ${routePath}`;

        return ctx.tracer.startActiveSpan(spanName, async (span) => {
            try {
                span.setAttribute('http.method', req.method);
                span.setAttribute('http.route', routePath);
                span.setAttribute('http.target', req.url);
                span.setAttribute('auth.required', false);

                const params = {...req.body, params: req.params, query: req.query} as Params;
                const agent = await sessionAgent(req, res, ctx);
                const json = await fn(ctx, agent, params);

                if (json.error) {
                    span.setAttribute('response.error', json.error);
                    span.setStatus({ code: SpanStatusCode.ERROR, message: json.error });
                } else {
                    span.setStatus({ code: SpanStatusCode.OK });
                }

                return res.json(json);
            } catch (error) {
                span.recordException(error as Error);
                span.setStatus({
                    code: SpanStatusCode.ERROR,
                    message: (error as Error).message
                });
                throw error;
            } finally {
                span.end();
            }
        });
    };
}


export function makeAdminHandler<P, Q>(ctx: AppContext, handler: CAHandler<P, Q>): express.Handler {
    const adminOnlyHandler: CAHandler<P, Q> = async (ctx, agent, params) => {
        if (isAdmin(agent.did)) {
            return handler(ctx, agent, params);
        } else {
            return {error: "Necesitás permisos de administrador para realizar esta acción."};
        }
    };

    return makeHandler(ctx, adminOnlyHandler);
}


export function isAdmin(did: string) {
    return [
        "did:plc:2356xofv4ntrbu42xeilxjnb",
        "did:plc:rup47j6oesjlf44wx4fizu4m",
        "did:plc:2dbz7h5m3iowpqc23ozltpje",
        "did:plc:2semihha42b7efhu4ywv7whi"
    ].includes(did)
}


export function makeAdminHandlerNoAuth<P, Q>(ctx: AppContext, handler: CAHandlerNoAuth<P, Q>): express.Handler {
    return async (req, res) => {
        const routePath = req.route?.path || req.path;
        const spanName = `${req.method} ${routePath}`;

        return ctx.tracer.startActiveSpan(spanName, async (span) => {
            try {
                span.setAttribute('http.method', req.method);
                span.setAttribute('http.route', routePath);
                span.setAttribute('http.target', req.url);
                span.setAttribute('handler.type', 'admin');

                const params = {...req.body, params: req.params, query: req.query} as P;
                const agent = await sessionAgent(req, res, ctx);

                const admin = agent.hasSession() && isAdmin(agent.did);
                const authHeader = req.headers.authorization || '';
                const token = authHeader.replace(/^Bearer\s+/i, '');
                const validToken = token == env.ADMIN_TOKEN;

                span.setAttribute('auth.is_admin', admin);
                span.setAttribute('auth.has_valid_token', validToken);

                if(admin || validToken) {
                    const json = await handler(ctx, agent, params);

                    if (json.error) {
                        span.setAttribute('response.error', json.error);
                        span.setStatus({ code: SpanStatusCode.ERROR, message: json.error });
                    } else {
                        span.setStatus({ code: SpanStatusCode.OK });
                    }

                    return res.json(json);
                } else {
                    span.setStatus({ code: SpanStatusCode.ERROR, message: 'No admin session' });
                    return res.json({error: "No session"});
                }
            } catch (error) {
                span.recordException(error as Error);
                span.setStatus({
                    code: SpanStatusCode.ERROR,
                    message: (error as Error).message
                });
                throw error;
            } finally {
                span.end();
            }
        });
    };
}