import {z} from 'zod';
import {readingBlockSchema, topicSummarySchema} from './topics';
import {actionErrors, resourceListQuerySchema, paginationSchema, binaryBody, idParams, jsonBody, pendingResponse, sessionSecurity, successResponse, type ApiContract} from './common';

export const datasetColumnTypeSchema = z.enum(['text', 'integer', 'decimal', 'boolean', 'date', 'datetime']);
export const datasetColumnSchema = z.object({name: z.string(), type: datasetColumnTypeSchema});
export const csvOptionsSchema = z.object({delimiter: z.enum([',', ';']), decimal: z.enum(['.', ','])});
export const datasetSourceOptionsSchema = z.object({sourceFormat: z.enum(['csv', 'json']), jqFilter: z.string().nullable()});
export const datasetContentSchema = datasetSourceOptionsSchema.extend({title: z.string(), description: z.string(), fileId: z.string().nullable(), sourceUrl: z.string().nullable(), columns: z.array(datasetColumnSchema), csvOptions: csvOptionsSchema, rowCount: z.number().optional()});
export const datasetCellSchema = z.object({raw: z.string(), value: z.union([z.string(), z.number(), z.boolean(), z.null()]), error: z.string().nullable()});
export const datasetPreviewSchema = datasetSourceOptionsSchema.extend({fileId: z.string().nullable(), fileName: z.string().nullable(), sourceUrl: z.string().nullable(), columns: z.array(datasetColumnSchema), csvOptions: csvOptionsSchema, rows: z.array(z.array(z.string())), rowCount: z.number(), snapshotId: z.string(), page: z.number()});
export const datasetUpdateSchema = z.object({state: z.enum(['ready', 'checking', 'preparing', 'failed']), snapshotId: z.string().nullable(), error: z.string().nullable()});
export const datasetOutputSchema = datasetContentSchema.extend({id: z.string(), topic: topicSummarySchema, rows: z.array(z.array(datasetCellSchema)), rowCount: z.number(), snapshotId: z.string(), page: z.number(), update: datasetUpdateSchema.optional()});
export const datasetMetadataSchema = z.object({title: z.string(), description: z.string(), rowCount: z.number().optional(), checkedAt: z.string().nullable().optional()});
export const datasetReferenceSchema = z.object({topicId: z.string(), blockNumber: z.string()});
export const datasetSourceSchema = datasetReferenceSchema.extend({versionId: z.string(), title: z.string(), rowCount: z.number().optional(), columns: z.array(datasetColumnSchema), topic: topicSummarySchema});
export const datasetSourceDetailsSchema = datasetSourceSchema.extend({block: readingBlockSchema});
export const datasetListSchema = paginationSchema.extend({items: z.array(z.object({topic: topicSummarySchema, block: readingBlockSchema, source: datasetSourceSchema.nullable().describe('Fuente de datos; null si el registro de eliminación no tiene una fuente propia.')}))});
export const tableOrderSchema = z.object({field: z.string(), direction: z.enum(['asc', 'desc'])});
export const tableColumnSchema = z.object({field: z.string(), label: z.string().optional()});
export const tablePageInputSchema = z.object({columns: z.array(z.string()), page: z.number(), pageSize: z.number(), search: z.string(), order: tableOrderSchema.nullable(), snapshotId: z.string().optional(), retry: z.boolean().optional()});
export const tablePageOutputSchema = z.object({columns: z.array(datasetColumnSchema), rows: z.array(z.array(datasetCellSchema)), page: z.number(), rowCount: z.number(), totalRows: z.number(), snapshotId: z.string(), update: datasetUpdateSchema});
export const datasetPreviewInputSchema = datasetSourceOptionsSchema.partial().extend({fileId: z.string().nullable().optional(), sourceUrl: z.string().nullable().optional(), snapshotId: z.string().optional(), page: z.number().optional(), retry: z.boolean().optional()});
export const datasetUploadSchema = datasetSourceOptionsSchema.extend({fileId: z.string(), fileName: z.string(), sourceUrl: z.null()});
const datasetResponses = {...actionErrors, '202': pendingResponse};
export const datasetsContract = {
    '/datasets': {get: {operationId: 'listDatasets', summary: 'Buscar datasets', tags: ['Datasets'],
        requestParams: {query: resourceListQuerySchema}, responses: {...datasetResponses, '200': successResponse(datasetListSchema, 'Página de datasets.')}}},
    '/datasets/:topicId/:blockNumber': {get: {operationId: 'getDatasetSource', summary: 'Consultar una fuente de datos', tags: ['Datasets'],
        requestParams: {path: datasetReferenceSchema}, responses: {...datasetResponses, '200': successResponse(datasetSourceDetailsSchema, 'Fuente, tema y bloque.')}}},
    '/datasets/upload': {post: {operationId: 'uploadDataset', summary: 'Cargar un archivo CSV o JSON', tags: ['Datasets'], security: sessionSecurity,
        description: 'Enviá los bytes del archivo con Content-Type application/octet-stream y su nombre en el parámetro name. El servidor valida el tamaño y formato antes de almacenarlo.',
        requestParams: {query: z.object({name: z.string()})}, requestBody: binaryBody,
        responses: {...datasetResponses, '201': successResponse(datasetUploadSchema, 'Archivo cargado.')}}},
    '/datasets/preview': {post: {operationId: 'previewDataset', summary: 'Preparar una vista previa de un dataset', tags: ['Datasets'], security: sessionSecurity,
        description: 'Usá fileId o sourceUrl, exclusivamente uno. La preparación puede devolver 202; reintentá para obtener el resultado.',
        requestBody: jsonBody(datasetPreviewInputSchema), responses: {...datasetResponses, '200': successResponse(datasetPreviewSchema, 'Página de vista previa.')}}},
    '/datasets/versions/:id/table-page': {post: {operationId: 'getDatasetTablePage', summary: 'Consultar una página de tabla', tags: ['Datasets'],
        requestParams: {path: idParams}, requestBody: jsonBody(tablePageInputSchema), responses: {...datasetResponses, '200': successResponse(tablePageOutputSchema, 'Página filtrada y ordenada.')}}},
    '/datasets/versions/:id': {get: {operationId: 'getDatasetVersion', summary: 'Obtener una versión de dataset', tags: ['Datasets'],
        requestParams: {path: idParams, query: z.object({page: z.string().optional(), snapshotId: z.string().optional(), retry: z.enum(['true', 'false']).optional()})},
        responses: {...datasetResponses, '200': successResponse(datasetOutputSchema, 'Dataset con sus filas.')}}},
    '/datasets/versions/:id/metadata': {get: {operationId: 'getDatasetMetadata', summary: 'Consultar metadatos de un dataset', tags: ['Datasets'],
        requestParams: {path: idParams}, responses: {...datasetResponses, '200': successResponse(datasetMetadataSchema, 'Metadatos y última comprobación.')}}},
    '/datasets/versions/:id/update': {get: {operationId: 'getDatasetUpdate', summary: 'Consultar el estado de actualización', tags: ['Datasets'],
        requestParams: {path: idParams}, responses: {...datasetResponses, '200': successResponse(datasetUpdateSchema, 'Estado de actualización.')}}},
} satisfies ApiContract;

export type DatasetColumnType = z.output<typeof datasetColumnTypeSchema>;
export type DatasetColumn = z.output<typeof datasetColumnSchema>;
export type CSVOptions = z.output<typeof csvOptionsSchema>;
export type DatasetSourceOptions = z.output<typeof datasetSourceOptionsSchema>;
export type DatasetContent = z.output<typeof datasetContentSchema>;
export type DatasetCell = z.output<typeof datasetCellSchema>;
export type DatasetPreview = z.output<typeof datasetPreviewSchema>;
export type DatasetOutput = z.output<typeof datasetOutputSchema>;
export type DatasetUpdate = z.output<typeof datasetUpdateSchema>;
export type DatasetMetadata = z.output<typeof datasetMetadataSchema>;
export type DatasetReference = z.output<typeof datasetReferenceSchema>;
export type TableOrder = z.output<typeof tableOrderSchema>;
export type TableColumn = z.output<typeof tableColumnSchema>;
export type TablePageInput = z.output<typeof tablePageInputSchema>;
export type TablePageOutput = z.output<typeof tablePageOutputSchema>;

export type DatasetSource = z.output<typeof datasetSourceSchema>;
export type DatasetSourceDetails = z.output<typeof datasetSourceDetailsSchema>;
export type DatasetListOutput = z.output<typeof datasetListSchema>;
