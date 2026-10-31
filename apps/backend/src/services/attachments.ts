import type {ResourceListQuery} from '@cabildo-abierto/api';
import type {SearchDatabase} from './search/schema.js';
import {searchAttachments} from './search/attachments.js';
import {loadConvergedBlocks} from './topic-convergence.js';

export async function listAttachments(database: SearchDatabase, type: 'documento' | 'dataset', query: ResourceListQuery) {
    const {results, ...pagination} = await searchAttachments(database, {
        type, q: query.search ?? '', topicId: query.topicId, preferredTopicId: query.preferredTopicId,
        page: Number(query.page ?? 0), pageSize: Number(query.pageSize ?? 12), includeDeleted: query.includeDeleted === 'true',
    });
    const blocks = await loadConvergedBlocks(database, results.map(({topic: _topic, ...block}) => block));
    return {...pagination, items: results.map((result, index) => ({topic: result.topic, block: blocks[index]}))};
}
