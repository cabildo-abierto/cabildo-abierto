import express from 'express';
import {sql} from 'kysely';
import type {DatasetSource, LccaAnalysis, LccaOutput} from '@cabildo-abierto/api';
import {parseDatasetBlock} from '@cabildo-abierto/utils';
import type {AppContext} from '#/setup.js';
import {requireSession} from '#/auth/middleware.js';
import {topicConvergence} from '#/services/topic-convergence.js';
import {TopicActionError} from '#/services/topic-title-edits.js';
import {R2Storage, type ObjectStorage} from '#/services/storage/storage.js';
import {readySnapshot,DatasetPending} from '#/services/datasets/snapshots.js';
import {requireDatasetAccess} from '#/services/datasets/access.js';
import {runQueryJob, type QueryTable} from '#/services/visualizations/query-process.js';
import {resolveSources} from '#/services/visualizations/resolve-sources.js';
import {datasetSourceBlocks} from '#/services/visualizations/source-blocks.js';

export function visualizationRoutes(ctx: AppContext, createStorage: () => ObjectStorage = () => new R2Storage()) {
    const router = express.Router();
    router.use((_req,res,next)=>{res.set('Cache-Control','no-store');next();});
    let storage: ObjectStorage | undefined;
    const getStorage = () => storage ??= createStorage();
    const fail = (res: express.Response, error: unknown) => {
        if (error instanceof DatasetPending) return res.status(202).json({success:true,pending:true,state:error.state});
        if (error instanceof TopicActionError) return res.status(error.status).json({success: false, error: error.message});
        ctx.logger.pino.error({error}, 'visualization request failed');
        return res.status(500).json({success: false, error: 'No pudimos cargar la visualización. Podés reintentar.'});
    };
    router.get('/datasets', async (req, res) => {
        try {
            const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0,200) : '';
            const topicId = typeof req.query.topicId === 'string' ? req.query.topicId : '';
            const topics = await ctx.kysely.selectFrom('topic').innerJoin('block', 'block.topic_id', 'topic.id')
                .innerJoin('block_version', join => join.onRef('block_version.topic_id', '=', 'block.topic_id').onRef('block_version.block_number', '=', 'block.block_number'))
                .innerJoin('dataset', 'dataset.id', 'block_version.id')
                .select(['topic.id', 'topic.title', 'topic.slug']).groupBy(['topic.id', 'topic.title', 'topic.slug']).where('block.type_id', '=', 'dataset')
                .where(eb => eb.or([eb('topic.title', 'ilike', `%${search}%`), eb('dataset.title', 'ilike', `%${search}%`)]))
                .orderBy(sql<number>`case when topic.id = ${topicId} then 0 else 1 end`).orderBy('topic.title').limit(20).execute();
            const sources: DatasetSource[] = [];
            for (const topic of topics) {
                for (const block of await topicConvergence(ctx.kysely, topic.id)) {
                    if (block.typeId !== 'dataset' || block.deleted) continue;
                    const data = parseDatasetBlock(block.content);
                    if (data && (!search || `${topic.title} ${data.title}`.toLowerCase().includes(search.toLowerCase()))) sources.push({topic, topicId: topic.id, blockNumber: block.blockNumber, versionId: block.id, title: data.title, columns: data.columns});
                }
            }
            res.json({success: true, value: {sources: sources.slice(0, 100)}});
        } catch (error) { fail(res, error); }
    });
    router.get('/datasets/:topicId/:blockNumber', async (req, res) => {
        try {
            const {sources: [{topic,block}]} = await datasetSourceBlocks(ctx.kysely,[{topicId: String(req.params.topicId),blockNumber: String(req.params.blockNumber)}]);
            const topicId = topic.id;
            const data = parseDatasetBlock(block.content)!;
            const value: DatasetSource = {topic, topicId, blockNumber: block.blockNumber, versionId: block.id, title: data.title, columns: data.columns};
            res.set('Cache-Control', 'no-store').json({success: true, value});
        } catch (error) { fail(res,error); }
    });
    router.post('/lcca/sources', async (req,res) => {
        try {
            if (req.body?.queryLanguageVersion !== 1 || typeof req.body?.query !== 'string') throw new TopicActionError(400,'La consulta o su versión no es válida.');
            const parsed = await runQueryJob<LccaAnalysis>({type: 'analyze',query: req.body.query});
            const {analysis} = await resolveSources(ctx.kysely,parsed);
            res.set('Cache-Control','no-store').json({success: true,value: await datasetSourceBlocks(ctx.kysely,analysis.sources)});
        } catch (error) { fail(res,error); }
    });
    router.post('/lcca/analyze', requireSession(ctx), async (req, res) => {
        try {
            if (req.body?.queryLanguageVersion !== 1 || typeof req.body?.query !== 'string') throw new TopicActionError(400, 'La consulta o su versión no es válida.');
            const parsed = await runQueryJob<LccaAnalysis>({type: 'analyze', query: req.body.query});
            const {analysis: value} = await resolveSources(ctx.kysely,parsed);
            res.json({success: true, value});
        } catch (error) { fail(res, error); }
    });
    router.post('/lcca/query', async (req, res) => {
        try {
            if (req.body?.queryLanguageVersion !== 1 || typeof req.body?.query !== 'string') throw new TopicActionError(400, 'La consulta o su versión no es válida.');
            const parsed = await runQueryJob<LccaAnalysis>({type: 'analyze', query: req.body.query});
            const {analysis,resolvedTopicIds} = await resolveSources(ctx.kysely,parsed);
            const {sources: blocks} = await datasetSourceBlocks(ctx.kysely,analysis.sources);
            const outcomes = await Promise.allSettled(blocks.map(async ({topic,block}):Promise<QueryTable>=>{
                const dataset = await requireDatasetAccess(ctx.kysely,block.id);
                const snapshot = await readySnapshot(ctx.kysely,dataset.source_id,getStorage(),{retry:req.body.retry===true});
                return {topicId:topic.id,blockNumber:block.blockNumber,versionId:block.id,columns:dataset.columns,
                    snapshotId:snapshot.id,url:await getStorage().signedUrl(snapshot,'inline','application/vnd.apache.parquet'),
                    sourceColumns:snapshot.columns,csvOptions:snapshot.csv_options,rowCount:snapshot.row_count,columnBytes:snapshot.column_bytes};
            }));
            const failed = outcomes.find(r=>r.status==='rejected' && !(r.reason instanceof DatasetPending));
            if(failed?.status==='rejected')throw failed.reason;
            const pending = outcomes.find(r=>r.status==='rejected');
            if(pending?.status==='rejected')throw pending.reason;
            const tables = outcomes.map(r=>(r as PromiseFulfilledResult<QueryTable>).value);
            const value = await runQueryJob<LccaOutput>({type: 'execute', query: req.body.query, tables, resolvedTopicIds});
            res.set('Cache-Control', 'no-store').json({success: true, value});
        } catch (error) { fail(res, error); }
    });
    return router;
}
