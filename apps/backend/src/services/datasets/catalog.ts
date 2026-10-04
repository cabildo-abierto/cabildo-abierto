import type {Transaction} from 'kysely';
import type {DB} from '#/db/types.js';
import type {DatasetCatalogOutput} from '@cabildo-abierto/api';
import {searchAttachments} from '../search/attachments.js';

export async function datasetCatalog(database: Transaction<DB>, query: string, preferredTopicId: string): Promise<DatasetCatalogOutput> {
    const {results} = await searchAttachments(database, {q: query, type: 'dataset', page: 0, pageSize: 5, preferredTopicId});
    if (!results.length) return {sources: []};
    const datasets = await database.selectFrom('dataset').select(['id', 'title', 'columns']).where('id', 'in', results.map(result => result.id)).execute();
    const byId = new Map(datasets.map(dataset => [dataset.id, dataset]));
    return {sources: results.map(result => {
        const dataset = byId.get(result.id)!;
        return {topic: result.topic, topicId: result.topic.id, blockNumber: result.blockNumber, versionId: result.id, title: dataset.title, columns: dataset.columns};
    })};
}
