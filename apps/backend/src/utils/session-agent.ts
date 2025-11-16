import type {IncomingMessage, ServerResponse} from "node:http";
import {getIronSession, SessionOptions} from "iron-session";
import express from "express";
import {AtpBaseClient, Agent as BskyAgent} from "@atproto/api";
import {env} from "#/lib/env.js";
import {AppContext} from "#/setup.js";

export type Session = { did: string }


export type Agent = BaseAgent


export class BaseAgent {
    ca: AtpBaseClient
    bsky: AtpBaseClient | BskyAgent
    constructor(CAAgent: AtpBaseClient, bsky: AtpBaseClient | BskyAgent) {
        this.ca = CAAgent
        this.bsky = bsky
    }
    hasSession(): this is SessionAgent {
        return false
    }
}


export class NoSessionAgent extends BaseAgent {
    bsky: AtpBaseClient
    constructor(CAAgent: AtpBaseClient, bsky: AtpBaseClient) {
        super(CAAgent, bsky)
        this.bsky = bsky
    }
}


export class SessionAgent extends BaseAgent {
    bsky: BskyAgent
    did: string
    req?: IncomingMessage
    res?: ServerResponse<IncomingMessage>
    constructor(CAAgent: AtpBaseClient, bskyAgent: BskyAgent, req?: IncomingMessage, res?: ServerResponse<IncomingMessage>) {
        super(CAAgent, bskyAgent)
        if(!bskyAgent || !bskyAgent.did){
            throw Error("No session.")
        }
        this.bsky = bskyAgent
        this.did = bskyAgent && bskyAgent.did
        this.req = req
        this.res = res
    }

    override hasSession(): this is SessionAgent {
        return true
    }
}


export const bskyPublicAPI = "https://public.api.bsky.app"


export async function sessionAgent(
    req: IncomingMessage,
    res: ServerResponse<IncomingMessage>,
    ctx: AppContext
): Promise<Agent> {
    const CAAgent = new AtpBaseClient(`${env.HOST}:${env.PORT}`)

    const session = await getIronSession<Session>(req, res, cookieOptions)
    if (session.did) {
        try {
            const oauthSession = await ctx.oauthClient?.restore(session.did)
            if(oauthSession) {
                const bskyAgent = new BskyAgent(oauthSession)
                return new SessionAgent(CAAgent, bskyAgent, req, res)
            }
        } catch (err) {
            ctx.logger.pino.warn({err}, 'oauth restore failed')
            await session.destroy()
        }
    }
    return new NoSessionAgent(CAAgent, new AtpBaseClient(bskyPublicAPI))
}


export const cookieOptions: SessionOptions = {
    cookieName: 'sid',
    password: env.COOKIE_SECRET!,
    cookieOptions: {
        sameSite: env.NODE_ENV == "production" ? "none" : "lax",
        httpOnly: true,
        secure: env.NODE_ENV == "production",
        path: "/"
    }
}


export const handler = (fn: express.Handler) =>
    async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        try {
            await fn(req, res, next)
        } catch (err) {
            next(err)
        }
    }