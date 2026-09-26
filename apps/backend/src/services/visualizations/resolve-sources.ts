import type {Kysely, Transaction} from 'kysely';
import type {LccaAnalysis, DatasetReference} from '@cabildo-abierto/api';
import type {DB} from '#/db/types.js';
import {resolveTopic} from '../resolve-topic.js';

export async function resolveSources(database: Kysely<DB> | Transaction<DB>, analysis: LccaAnalysis) {
    const resolvedTopicIds: Record<string,string> = Object.create(null);
    for (const reference of new Set(analysis.sources.map(source => source.topicId))) {
        resolvedTopicIds[reference] = (await resolveTopic(database,reference)).id;
    }
    const unique = new Map<string,DatasetReference>();
    for (const source of analysis.sources) {
        const resolved = {...source,topicId: resolvedTopicIds[source.topicId]};
        unique.set(JSON.stringify(resolved),resolved);
    }
    const value: LccaAnalysis = {sources: [...unique.values()],basicView: analysis.basicView ? {
        ...analysis.basicView,source: {...analysis.basicView.source,topicId: resolvedTopicIds[analysis.basicView.source.topicId]},
    } : null};
    return {analysis: value,resolvedTopicIds};
}
