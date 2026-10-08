import type {Kysely, Transaction} from 'kysely';
import type {DatasetReference, VisualizationSourcesOutput} from '@cabildo-abierto/api';
import type {DB} from '#/db/types.js';
import {parseDatasetBlock} from '@cabildo-abierto/utils';
import {loadConvergedBlocks, topicConvergenceReferences} from '../topic-convergence.js';
import {resolveTopic} from '../resolve-topic.js';
import {TopicActionError} from '../topic-title-edits.js';

export async function datasetSourceBlocks(database: Kysely<DB> | Transaction<DB>, references: DatasetReference[]): Promise<VisualizationSourcesOutput> {
    const sources: VisualizationSourcesOutput['sources'] = [];
    for (const reference of new Set(references.map(source => source.topicId))) {
        const topic = await resolveTopic(database,reference);
        const topicSources = references.filter(source => source.topicId === reference);
        const blockNumbers = [...new Set(topicSources.map(source => source.blockNumber))];
        const blocks = await loadConvergedBlocks(database, await topicConvergenceReferences(database,topic.id,'dataset',blockNumbers));
        for (const source of topicSources) {
            const block = blocks.find(block => block.blockNumber === source.blockNumber && block.typeId === 'dataset' && !block.deleted);
            if (!block || !parseDatasetBlock(block.content)) throw new TopicActionError(404,`No encontramos el conjunto de datos ${reference} / ${source.blockNumber}.`);
            if (!sources.some(existing => existing.topic.id === topic.id && existing.block.blockNumber === block.blockNumber)) sources.push({topic,block});
        }
    }
    return {sources};
}
