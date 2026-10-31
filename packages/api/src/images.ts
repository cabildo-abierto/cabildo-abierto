import {z} from 'zod';
import {actionErrors, binaryBody, jsonBody, optionalSessionSecurity, sessionSecurity, successResponse, type ApiContract} from './common';

export const imageContentSchema = z.object({fileId: z.string(), widthPercent: z.number(), alignment: z.enum(['left', 'center', 'right']), flow: z.enum(['separate', 'wrap']), alt: z.string(), caption: z.string()});
export const imageAssetSchema = z.object({fileId: z.string(), fileName: z.string(), width: z.number(), height: z.number(), url: z.string(), expiresAt: z.number()});
export const imageUploadSchema = imageAssetSchema.omit({url: true, expiresAt: true});
export const importImageSchema = z.object({url: z.string()});
export const imagesContract = {
    '/images/upload': {post: {operationId: 'uploadImage', summary: 'Cargar una imagen', tags: ['Imágenes'], security: sessionSecurity,
        description: 'Enviá los bytes con Content-Type application/octet-stream. Admite PNG, JPEG y WebP; máximo 20 MiB.',
        requestBody: binaryBody, responses: {...actionErrors, '201': successResponse(imageUploadSchema, 'Imagen almacenada.')}}},
    '/images/import': {post: {operationId: 'importImage', summary: 'Importar una imagen por URL', tags: ['Imágenes'], security: sessionSecurity,
        requestBody: jsonBody(importImageSchema), responses: {...actionErrors, '201': successResponse(imageUploadSchema, 'Imagen importada.')}}},
    '/images/files/:fileId': {get: {operationId: 'getImage', summary: 'Obtener una imagen y su URL temporal', tags: ['Imágenes'], security: optionalSessionSecurity,
        requestParams: {path: z.object({fileId: z.string()})}, responses: {...actionErrors, '200': successResponse(imageAssetSchema, 'URL temporal con su fecha de expiración.')}}},
} satisfies ApiContract;

export type ImageContent = z.output<typeof imageContentSchema>;
export type ImageAssetOutput = z.output<typeof imageAssetSchema>;
export type ImportImageInput = z.output<typeof importImageSchema>;
