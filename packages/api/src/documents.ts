import {z} from 'zod';
import {readingBlockSchema, topicSummarySchema, blockCommentsSchema, blockCommentOutputSchema, commentInputSchema} from './topics';
import {actionErrors, resourceListQuerySchema, paginationSchema, binaryBody, emptyValueSuccess, idParams, jsonBody, optionalSessionSecurity, sessionSecurity, successResponse, type ApiContract} from './common';

export const documentFormatSchema = z.enum(['pdf', 'office', 'text', 'markdown', 'ca', 'html']);
export const documentUploadSchema = z.object({fileId: z.string(), fileName: z.string(), previewError: z.string().nullable()});
export const documentImportSchema = documentUploadSchema.extend({format: documentFormatSchema, sourceUrl: z.string()});
export const documentOutputSchema = z.object({
    sourceUrl: z.string().nullable().optional(), id: z.string(), versionId: z.string(), title: z.string(), description: z.string(), topic: topicSummarySchema,
    format: documentFormatSchema, fileName: z.string(), size: z.number(), previewStatus: z.enum(['ready', 'failed', 'pending']), previewError: z.string().nullable(),
    canRetry: z.boolean(), text: z.string().nullable(), blocks: z.array(z.object({id: z.string(), typeId: z.enum(['parrafo', 'h1', 'h2']), content: z.string(), commentCount: z.number()})),
});
export const documentListSchema = paginationSchema.extend({items: z.array(z.object({topic: topicSummarySchema, block: readingBlockSchema}))});
const commentParams = idParams.extend({blockId: z.string()});
export const documentsContract = {
    '/documents': {get: {operationId: 'listDocuments', 'x-display-order': 10, summary: 'Buscar documentos', tags: ['Documentos'],
        requestParams: {query: resourceListQuerySchema}, responses: {...actionErrors, '200': successResponse(documentListSchema, 'Página de documentos.')}}},
    '/documents/import': {post: {operationId: 'importDocument', 'x-display-order': 40, summary: 'Importar un documento por URL', tags: ['Documentos'], security: sessionSecurity,
        requestBody: jsonBody(z.object({url: z.string().max(4096)})), responses: {...actionErrors, '201': successResponse(documentImportSchema, 'Documento importado.')}}},
    '/documents/upload': {post: {operationId: 'uploadDocument', 'x-display-order': 50, summary: 'Cargar un documento', tags: ['Documentos'], security: sessionSecurity,
        description: 'Enviá el archivo como contenido binario y su nombre en name. El servidor valida formato y tamaño y prepara la vista previa.',
        requestParams: {query: z.object({name: z.string()})}, requestBody: binaryBody, responses: {...actionErrors, '201': successResponse(documentUploadSchema, 'Documento cargado.')}}},
    '/documents/files/:id': {get: {operationId: 'getDocumentFile', 'x-display-order': 90, summary: 'Consultar un archivo de documento', tags: ['Documentos'], security: optionalSessionSecurity,
        requestParams: {path: idParams}, responses: {...actionErrors, '200': successResponse(z.object({fileId: z.string(), fileName: z.string()}), 'Identificador y nombre del archivo.')}}},
    '/documents/versions/:id': {get: {operationId: 'getDocumentVersion', 'x-display-order': 20, summary: 'Obtener una versión de documento', tags: ['Documentos'], security: optionalSessionSecurity,
        requestParams: {path: idParams}, responses: {...actionErrors, '200': successResponse(documentOutputSchema, 'Documento y contenido de vista previa.')}}},
    '/documents/versions/:id/file': {get: {operationId: 'downloadDocument', 'x-display-order': 30, summary: 'Descargar un documento', tags: ['Documentos'], security: optionalSessionSecurity,
        description: 'Con preview=true se utiliza la vista previa cuando está disponible.',
        requestParams: {path: idParams, query: z.object({preview: z.enum(['true', 'false']).optional()})}, responses: {...actionErrors, '200': {description: 'Contenido del archivo.', content: {'application/octet-stream': {schema: z.string().meta({format: 'binary'})}}}}}},
    '/documents/versions/:id/preview': {post: {operationId: 'retryDocumentPreview', 'x-display-order': 100, summary: 'Reintentar la conversión de un documento', tags: ['Documentos'], security: sessionSecurity,
        requestParams: {path: idParams}, responses: {...actionErrors, '200': emptyValueSuccess}}},
    '/documents/versions/:id/blocks/:blockId/comments': {
        get: {operationId: 'getDocumentComments', 'x-display-order': 60, summary: 'Listar comentarios de un bloque de documento', tags: ['Documentos'], security: optionalSessionSecurity,
            requestParams: {path: commentParams}, responses: {...actionErrors, '200': successResponse(blockCommentsSchema, 'Comentarios del bloque.')}},
        post: {operationId: 'createDocumentComment', 'x-display-order': 70, summary: 'Comentar un bloque de documento', tags: ['Documentos'], security: sessionSecurity,
            requestParams: {path: commentParams}, requestBody: jsonBody(commentInputSchema), responses: {...actionErrors, '201': successResponse(blockCommentOutputSchema, 'Comentario publicado.')}},
    },
    '/documents/versions/:id/blocks/:blockId/comments/:commentId': {delete: {operationId: 'deleteDocumentComment', 'x-display-order': 80, summary: 'Eliminar un comentario de documento', tags: ['Documentos'], security: sessionSecurity,
        requestParams: {path: commentParams.extend({commentId: z.string()})}, responses: {...actionErrors, '200': emptyValueSuccess}}},
} satisfies ApiContract;

export type DocumentFormat = z.output<typeof documentFormatSchema>;
export type DocumentUploadOutput = z.output<typeof documentUploadSchema>;
export type DocumentImportOutput = z.output<typeof documentImportSchema>;
export type DocumentOutput = z.output<typeof documentOutputSchema>;

export type DocumentListOutput = z.output<typeof documentListSchema>;
