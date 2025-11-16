import {Agent, sessionAgent, SessionAgent} from "#/utils/session-agent.js";
import {AppContext} from "#/setup.js";
import express from "express";

export type CAHandlerOutput<Output> = Promise<{error?: string, data?: Output}>
export type CAHandler<Params={}, Output={}> = (ctx: AppContext, agent: SessionAgent, params: Params) => CAHandlerOutput<Output>
export type CAHandlerNoAuth<Params={}, Output={}> = (ctx: AppContext, agent: Agent, params: Params) => CAHandlerOutput<Output>


export function makeHandler<Params={}, Output={}>(ctx: AppContext, fn: CAHandler<Params, Output>): express.Handler {
    return async (req, res) => {
        const params = {...req.body, params: req.params, query: req.query} as Params
        const agent = await sessionAgent(req, res, ctx)
        if(agent.hasSession()) {
            const json = await fn(ctx, agent, params)
            return res.json(json)
        } else {
            return res.json({error: "Unauthorized"})
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