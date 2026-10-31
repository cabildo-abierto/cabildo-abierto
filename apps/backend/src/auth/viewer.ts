import {createHmac} from 'node:crypto';
import {isIP} from 'node:net';
import type {Request} from 'express';
import {env} from '#/lib/env.js';
import {currentUser} from './middleware.js';

function canonicalIp(ip: string): string {
    if (isIP(ip) === 4) return ip;
    if (isIP(ip) !== 6) throw new Error('No pudimos determinar la IP del visitante.');
    const address = new URL(`http://[${ip}]/`).hostname.slice(1, -1);
    const mapped = /^::ffff:([a-f0-9]+):([a-f0-9]+)$/.exec(address);
    if (!mapped) return address;
    const high = parseInt(mapped[1], 16), low = parseInt(mapped[2], 16);
    return `${high >>> 8}.${high & 255}.${low >>> 8}.${low & 255}`;
}

export function getViewerId(req: Request): string {
    const user = currentUser(req);
    if (user) return `user:${user.id}`;

    const ip = canonicalIp(req.ip ?? req.socket.remoteAddress ?? '');
    // Shared across replicas, without storing the visitor's IP in topic_connection.
    const identity = createHmac('sha256', env.COOKIE_SECRET).update('topic-viewer:').update(ip).digest('hex');
    return `visitor:${identity}`;
}
