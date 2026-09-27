import type {Kysely} from 'kysely';
import type {DB} from '#/db/types.js';
import {lockSearchMutation} from './schema.js';
import {requestUrlIndex} from './index.js';

const downloads = new Map<string, {data: Uint8Array; at: number}>();

export function cachedSearchDownload(url: string) {
    const cached = downloads.get(url);
    if (cached && Date.now() - cached.at < 60_000) return cached.data;
    downloads.delete(url);
    return undefined;
}

export async function refreshSearchUrl(database: Kysely<DB>, url: string, data: Uint8Array) {
    downloads.delete(url);
    downloads.set(url, {data, at: Date.now()});
    while (downloads.size > 2) downloads.delete(downloads.keys().next().value!);
    await database.transaction().execute(async trx => {
        await lockSearchMutation(trx);
        await requestUrlIndex(trx, url);
    });
}
