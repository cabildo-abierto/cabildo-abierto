import {randomBytes, randomUUID} from 'node:crypto';
import type {ApiToken, CreateApiTokenInput, PublicUser} from '@cabildo-abierto/api';
import type {Selectable, Kysely} from 'kysely';
import type {DB} from '#/db/types.js';
import {hashSessionToken as hashToken} from './session.js';

type TokenMetadata = Pick<Selectable<DB['api_token']>, 'id' | 'name' | 'token_prefix' | 'created_at' | 'expires_at'>;

function metadata(row: TokenMetadata): ApiToken {
    return {id: row.id, name: row.name, prefix: row.token_prefix, createdAt: row.created_at.toISOString(), expiresAt: row.expires_at.toISOString()};
}

export async function createApiToken(database: Kysely<DB>, userId: string, input: CreateApiTokenInput) {
    const token = `ca_${randomBytes(32).toString('base64url')}`;
    const createdAt = new Date();
    const row = await database.insertInto('api_token').values({
        id: randomUUID(), user_id: userId, name: input.name.trim(), token_hash: hashToken(token), token_prefix: token.slice(0, 11),
        created_at: createdAt, expires_at: new Date(createdAt.getTime() + (input.expiresInDays ?? 30) * 24 * 60 * 60 * 1000),
    }).returning(['id', 'name', 'token_prefix', 'created_at', 'expires_at']).executeTakeFirstOrThrow();
    return {...metadata(row), token};
}

export async function listApiTokens(database: Kysely<DB>, userId: string) {
    const rows = await database.selectFrom('api_token').select(['id', 'name', 'token_prefix', 'created_at', 'expires_at'])
        .where('user_id', '=', userId).orderBy('created_at', 'desc').execute();
    return {tokens: rows.map(metadata)};
}

export async function revokeApiToken(database: Kysely<DB>, userId: string, id: string) {
    const result = await database.deleteFrom('api_token').where('id', '=', id).where('user_id', '=', userId).executeTakeFirst();
    return result.numDeletedRows > 0n;
}

export async function getApiTokenUser(database: Kysely<DB>, token: string): Promise<PublicUser | null> {
    const user = await database.selectFrom('api_token').innerJoin('user', 'user.id', 'api_token.user_id').select(['user.id', 'user.username'])
        .where('api_token.token_hash', '=', hashToken(token)).where('api_token.expires_at', '>', new Date()).executeTakeFirst();
    return user ?? null;
}
