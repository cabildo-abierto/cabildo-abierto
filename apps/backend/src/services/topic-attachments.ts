import {createHash} from 'node:crypto';
import type {Transaction} from 'kysely';
import type {DB} from '#/db/types.js';
import type {TopicAttachmentsOutput, TopicReadingOutput} from '@cabildo-abierto/api';
import {isAttachmentBlock} from '@cabildo-abierto/utils';
import {loadConvergedBlocks, topicConvergenceReferences} from './topic-convergence.js';
import {searchAttachments} from './search/attachments.js';

export async function topicReading(database: Transaction<DB>, topicId: string): Promise<TopicReadingOutput> {
    const references = await topicConvergenceReferences(database, topicId);
    const blocks = await loadConvergedBlocks(database, references.filter(block => !isAttachmentBlock(block.typeId)));
    const summary = (type: 'documento' | 'dataset') => {
        const selected = references.filter(block => block.typeId === type);
        return {
            count: selected.filter(block => !block.deleted).length,
            deletedCount: selected.filter(block => block.deleted).length,
            revision: createHash('sha256').update(JSON.stringify(selected)).digest('hex'),
        };
    };
    return {blocks: blocks.filter(block => !block.deleted), deletedBlocks: blocks.filter(block => block.deleted),
        attachments: {documento: summary('documento'), dataset: summary('dataset')}};
}

export async function topicAttachments(database: Transaction<DB>, topicId: string, type: 'documento' | 'dataset', search: string, requestedPage: number, includeDeleted: boolean): Promise<TopicAttachmentsOutput> {
    if (search.trim()) {
        const {results, ...pagination} = await searchAttachments(database, {q: search, type, topicId, page: requestedPage});
        const references = results.map(({id, blockNumber, typeId, order, deleted}) => ({id, blockNumber, typeId, order, deleted}));
        return {...pagination, blocks: await loadConvergedBlocks(database, references)};
    }
    const pageSize = 12;
    const references = (await topicConvergenceReferences(database, topicId, type)).filter(block => includeDeleted || !block.deleted);
    const total = references.length;
    const page = Math.min(requestedPage, Math.max(0, Math.ceil(total / pageSize) - 1));
    return {blocks: await loadConvergedBlocks(database, references.slice(page * pageSize, (page + 1) * pageSize)), total, page, pageSize};
}
