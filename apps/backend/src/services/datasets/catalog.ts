import type {Transaction} from 'kysely';
import type {DB} from '#/db/types.js';
import type {DatasetCatalogOutput} from '@cabildo-abierto/api';
import {searchAttachments} from '../search/attachments.js';

export async function datasetCatalog(database: Transaction<DB>, query: string, preferredTopicId: string): Promise<DatasetCatalogOutput> {
    const {results} = await searchAttachments(database, {q: query, type: 'dataset', page: 0, pageSize: 5, preferredTopicId});
    if (!results.length) return {sources: []};
    const datasets = await database.selectFrom('dataset')
        .leftJoin('dataset_source', 'dataset_source.id', 'dataset.source_id')
        .leftJoin('dataset_snapshot', 'dataset_snapshot.id', 'dataset_source.snapshot_id')
        .select(['dataset.id', 'dataset.title', 'dataset.columns', 'dataset_snapshot.row_count'])
        .where('dataset.id', 'in', results.map(result => result.id)).execute();
    const byId = new Map(datasets.map(dataset => [dataset.id, dataset]));
    return {sources: results.map(result => {
        const dataset = byId.get(result.id)!;
        return {topic: result.topic, topicId: result.topic.id, blockNumber: result.blockNumber, versionId: result.id, title: dataset.title, rowCount: dataset.row_count ?? undefined, columns: dataset.columns};
    })};
}
