import type {Kysely, Transaction} from 'kysely';
import type {DB} from '#/db/types.js';
import {requireTopicAccess} from './topic-access.js';

export async function resolveTopic(database: Kysely<DB> | Transaction<DB>, reference: string) {
    return requireTopicAccess(database, reference);
}
