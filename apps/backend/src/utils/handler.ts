import {Agent, sessionAgent, SessionAgent} from "#/utils/session-agent.js";
import {AppContext} from "#/setup.js";
import express from "express";
import {env} from "#/lib/env.js";
import {Effect, Exit} from "effect";
import {runtime} from "#/instrumentation.js";


export type CAHandlerNoAuth<Params={}, Output={}> = (ctx: AppContext, agent: Agent, params: Params) => CAHandlerOutput<Output>

export type EffHandlerNoAuth<Params={}, Output={}> = (ctx: AppContext, agent: Agent, params: Params) => Effect.Effect<Output, string>

export type EffHandler<Params={}, Output={}> = (ctx: AppContext, agent: SessionAgent, params: Params) => Effect.Effect<Output, string>


const withHttpAttributes = (req: express.Request) =>
    Effect.annotateCurrentSpan({
        "http.method": req.method,
        "http.route": req.route?.path || req.path,
        "http.url": req.url,
        "http.target": req.path,
        "params": JSON.stringify(req.params),
        "query": JSON.stringify(req.query),
    });

const withUserAttributes = (agent: Agent) =>
    Effect.annotateCurrentSpan(
        agent.hasSession()
            ? {
                "user.authenticated": true,
                ...(agent.did ? { "user.did": agent.did } : {}),
            }
            : { "user.authenticated": false }
    );


export function makeEffHandler<Params = {}, Output = {}>(
    ctx: AppContext,
    fn: EffHandler<Params, Output>
): express.Handler {
    return async (req, res) => {
        const spanName = `${req.method} ${req.route?.path || req.path}`;

        const program = Effect.gen(function* () {
            yield* withHttpAttributes(req);

            const agent = yield* Effect.promise(() => sessionAgent(req, res, ctx));

            yield* withUserAttributes(agent);

            if (!agent.hasSession()) {
                return yield* Effect.fail("Sin sesión");
            }

            const params = {
                ...req.body,
                params: req.params,
                query: req.query,
            } as Params;

            yield* Effect.annotateCurrentSpan({
                params: JSON.stringify(req.params),
                query: JSON.stringify(req.query)
            })

            return yield* fn(ctx, agent, params);
        }).pipe(
            Effect.withSpan(spanName, {
                attributes: {
                    "span.kind": "server",
                },
            })
        );

        const exit = await runtime.runPromiseExit(
            program
        );

        Exit.match(exit, {
            onFailure: (cause) => {
                const error = cause.toString().replace(/^Error: /, '');

                if (error.includes("Unauthorized")) {
                    res.status(401).json({ error: "Sin sesión" });
                } else {
                    res.status(400).json({ error });
                }
            },
            onSuccess: (data) => {
                res.json({ data });
            },
        })
    }
}


export function makeEffHandlerNoAuth<Params = {}, Output = {}>(
    ctx: AppContext,
    fn: EffHandlerNoAuth<Params, Output>
): express.Handler {
    return async (req, res) => {
        const spanName = `${req.method} ${req.route?.path || req.path}`;

        const program = Effect.gen(function* () {
            yield* withHttpAttributes(req);

            const agent = yield* Effect.promise(() => sessionAgent(req, res, ctx));

            yield* withUserAttributes(agent);

            const params = {
                ...req.body,
                params: req.params,
                query: req.query,
            } as Params;

            yield* Effect.annotateCurrentSpan({
                params: JSON.stringify(req.params),
                query: JSON.stringify(req.query)
            })

            return yield* fn(ctx, agent, params);
        }).pipe(
            Effect.withSpan(spanName, {
                attributes: {
                    "span.kind": "server",
                },
            })
        );

        const exit = await runtime.runPromiseExit(
            program
        );

        Exit.match(exit, {
            onFailure: (cause) => {
                const error = cause.toString();
                res.status(400).json({ error });
            },
            onSuccess: (data) => {
                res.json({ data });
            },
        });
    };
}

export type CAHandlerOutput<Output> = Promise<{error?: string, data?: Output}>
export type CAHandler<Params={}, Output={}> = (ctx: AppContext, agent: SessionAgent, params: Params) => CAHandlerOutput<Output>

export function makeHandler<Params={}, Output={}>(ctx: AppContext, fn: CAHandler<Params, Output>): express.Handler {
    return async (req, res) => {
        const params = {...req.body, params: req.params, query: req.query} as Params
        const agent = await sessionAgent(req, res, ctx)
        if(agent.hasSession()) {
            const json = await fn(ctx, agent, params)
            return res.json(json)
        } else {
            return res.json({error: "Sin sesión"})
        }
    }
}


export function makeHandlerNoAuth<Params={}, Output={}>(ctx: AppContext, fn: CAHandlerNoAuth<Params, Output>): express.Handler {
    return async (req, res) => {
        const params = {...req.body, params: req.params, query: req.query} as Params
        const agent = await sessionAgent(req, res, ctx)
        const json = await fn(ctx, agent, params)
        return res.json(json)
    }
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


export function makeEffAdminHandler<P, Q>(ctx: AppContext, handler: EffHandler<P, Q>): express.Handler {
    const adminOnlyHandler: EffHandler<P, Q> = (ctx, agent, params) => {
        if (isAdmin(agent.did)) {
            return handler(ctx, agent, params);
        } else {
            return Effect.fail("Necesitás permisos de administrador para realizar esta acción.")
        }
    };

    return makeEffHandler(ctx, adminOnlyHandler);
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
        const params = {...req.body, params: req.params, query: req.query} as P
        const agent = await sessionAgent(req, res, ctx)

        const admin = agent.hasSession() && isAdmin(agent.did)
        const authHeader = req.headers.authorization || ''
        const token = authHeader.replace(/^Bearer\s+/i, '')
        const validToken = token == env.ADMIN_TOKEN

        if(admin || validToken) {
            const json = await handler(ctx, agent, params)
            return res.json(json)
        } else {
            return res.json({error: "No session"})
        }
    }
}