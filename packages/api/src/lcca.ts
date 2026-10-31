import type {VisualizationSpecV1} from './generated/visualization';
import {z} from 'zod';
import {readingBlockSchema, topicSummarySchema} from './topics';
import {datasetColumnSchema, datasetColumnTypeSchema, datasetReferenceSchema} from './datasets';
import {actionErrors, jsonBody, pendingResponse, sessionSecurity, successResponse, type ApiContract} from './common';

export type * from './generated/visualization';

export const tableValueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
export const typedTableSchema = z.object({columns: z.array(datasetColumnSchema), rows: z.array(z.array(tableValueSchema))});
export const viewFilterOperatorSchema = z.enum(['eq', 'ne', 'lt', 'lte', 'gt', 'gte', 'in', 'notIn', 'contains', 'isNull', 'isNotNull']);
export const viewFilterSchema = z.object({field: z.string(), type: datasetColumnTypeSchema, operator: viewFilterOperatorSchema, values: z.array(z.union([z.string(), z.number(), z.boolean()]))});
export const basicDataViewSchema = z.object({source: datasetReferenceSchema, columns: z.array(z.string()), filters: z.array(viewFilterSchema), filterMode: z.enum(['and', 'or']), orderBy: z.array(z.object({field: z.string(), direction: z.enum(['asc', 'desc'])}))});
export const lccaInputSchema = z.object({query: z.string(), queryLanguageVersion: z.literal(1), contextTopicId: z.string().optional()});
export const lccaQueryInputSchema = lccaInputSchema.extend({retry: z.boolean().optional()});
export const lccaAnalysisSchema = z.object({sources: z.array(datasetReferenceSchema), basicView: basicDataViewSchema.nullable()});
export const lccaOutputSchema = typedTableSchema.extend({sources: z.array(datasetReferenceSchema.extend({versionId: z.string(), snapshotId: z.string()}))});
export const visualizationSourcesSchema = z.object({sources: z.array(z.object({topic: topicSummarySchema, block: readingBlockSchema}))});
const responses = {...actionErrors, '202': pendingResponse};
export const lccaContract = {
    '/lcca/sources': {post: {operationId: 'getQuerySources', 'x-display-order': 20, summary: 'Resolver las fuentes de una consulta LCCA', tags: ['Visualizaciones'],
        requestBody: jsonBody(lccaInputSchema), responses: {...responses, '200': successResponse(visualizationSourcesSchema, 'Fuentes utilizadas.')}}},
    '/lcca/analyze': {post: {operationId: 'analyzeQuery', 'x-display-order': 30, summary: 'Analizar una consulta LCCA', tags: ['Visualizaciones'], security: sessionSecurity,
        requestBody: jsonBody(lccaInputSchema), responses: {...responses, '200': successResponse(lccaAnalysisSchema, 'Fuentes y vista básica de la consulta.')}}},
    '/lcca/query': {post: {operationId: 'executeQuery', 'x-display-order': 10, summary: 'Ejecutar una consulta LCCA', tags: ['Visualizaciones'],
        requestBody: jsonBody(lccaQueryInputSchema), responses: {...responses, '200': successResponse(lccaOutputSchema, 'Tabla resultante y snapshots utilizados.')}}},
} satisfies ApiContract;

export type TableValue = z.output<typeof tableValueSchema>;
export type TypedTable = z.output<typeof typedTableSchema>;
export type VisualizationContent = {query: string; queryMode: 'auto' | 'custom'; queryLanguageVersion: 1; spec: VisualizationSpecV1};
export type ViewFilterOperator = z.output<typeof viewFilterOperatorSchema>;
export type ViewFilter = z.output<typeof viewFilterSchema>;
export type BasicDataView = z.output<typeof basicDataViewSchema>;
export type LccaInput = z.output<typeof lccaInputSchema>;
export type LccaAnalysis = z.output<typeof lccaAnalysisSchema>;
export type LccaOutput = z.output<typeof lccaOutputSchema>;
export type VisualizationSourcesOutput = z.output<typeof visualizationSourcesSchema>;
