import type {
    NodeSavedSession,
    NodeSavedSessionStore,
    NodeSavedState,
    NodeSavedStateStore,
    RuntimeLock,
} from '@atproto/oauth-client-node';
import {type Redis} from "ioredis";

export class StateStore implements NodeSavedStateStore {
    constructor(private db: Redis) {}

    async get(key: string): Promise<NodeSavedState | undefined> {
        const result = await this.db.get(`authState:${key}`);
        if (!result) return undefined;
        return JSON.parse(result) as NodeSavedState;
    }

    async set(key: string, val: NodeSavedState) {
        const state = JSON.stringify(val);
        await this.db.set(`authState:${key}`, state);
    }

    async del(key: string) {
        await this.db.del(`authState:${key}`);
    }
}

export class SessionStore implements NodeSavedSessionStore {
    constructor(private db: Redis) {}

    async get(key: string): Promise<NodeSavedSession | undefined> {
        const result = await this.db.get(`authSession:${key}`);
        if (!result) return undefined;
        return JSON.parse(result) as NodeSavedSession;
    }

    async set(key: string, val: NodeSavedSession) {
        const session = JSON.stringify(val);
        await this.db.set(`authSession:${key}`, session);
    }

    async del(key: string) {
        await this.db.del(`authSession:${key}`);
    }
}


const LOCK_TIMEOUT = 10; // ms

export const createSessionLock = (redis: Redis): RuntimeLock => {
    return async (name, fn) => {
        const lockKey = `sessionLock:${name}`;
        const token = Math.random().toString(36).slice(2);
        const expireMs = LOCK_TIMEOUT;
        const retryDelay = 100; // ms
        const maxRetries = 50;

        let acquired = false;
        let retries = 0;

        while (!acquired && retries < maxRetries) {
            const result = await redis.set(lockKey, token, 'EX', expireMs, 'NX');

            if (result === 'OK') {
                acquired = true;
                break;
            }

            await new Promise(res => setTimeout(res, retryDelay));
            retries++;
        }

        if (!acquired) {
            throw new Error(`Failed to acquire lock for ${name}`);
        }

        try {
            return await fn();
        } finally {
            const val = await redis.get(lockKey);
            if (val === token) {
                await redis.del(lockKey);
            }
        }
    };
};