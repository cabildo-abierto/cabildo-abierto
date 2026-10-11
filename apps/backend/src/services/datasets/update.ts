import type {Kysely} from 'kysely';
import type {DB} from '#/db/types.js';
import type {DatasetUpdate} from '@cabildo-abierto/api';
import {TopicActionError} from '../topic-title-edits.js';

export async function datasetUpdate(database: Kysely<DB>, sourceId: string): Promise<DatasetUpdate> {
    const source = await database.selectFrom('dataset_source').select(['snapshot_id','status','error']).where('id','=',sourceId).executeTakeFirst();
    if (!source) throw new TopicActionError(404,'No encontramos la fuente del conjunto de datos.');
    return {state: source.status === 'failed' ? 'failed' : source.status === 'preparing' ? 'preparing'
        : source.status === 'checking' || source.status === 'pending' ? 'checking' : 'ready',
        snapshotId: source.snapshot_id, error: source.error};
}
