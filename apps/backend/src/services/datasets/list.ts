import type {DatasetListOutput, ResourceListQuery} from '@cabildo-abierto/api';
import type {SearchDatabase} from '../search/schema.js';
import {listAttachments} from '../attachments.js';

export async function listDatasets(database: SearchDatabase, query: ResourceListQuery): Promise<DatasetListOutput> {
    const page = await listAttachments(database, 'dataset', query);
    if (!page.items.length) return {...page, items: []};
    const datasets = await database.selectFrom('dataset')
        .leftJoin('dataset_source', 'dataset_source.id', 'dataset.source_id')
        .leftJoin('dataset_snapshot', 'dataset_snapshot.id', 'dataset_source.snapshot_id')
        .select(['dataset.id', 'dataset.title', 'dataset.columns', 'dataset_snapshot.row_count'])
        .where('dataset.id', 'in', page.items.map(item => item.block.id)).execute();
    const byId = new Map(datasets.map(dataset => [dataset.id, dataset]));
    return {...page, items: page.items.map(({topic, block}) => {
        const dataset = byId.get(block.id);
        if (!dataset && !block.deleted) throw new Error('No encontramos los datos del dataset vigente.');
        return {topic, block, source: dataset ? {topic, topicId: topic.id, blockNumber: block.blockNumber, versionId: block.id,
            title: dataset.title, rowCount: dataset.row_count ?? undefined, columns: dataset.columns} : null};
    })};
}
