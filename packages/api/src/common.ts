import {z} from 'zod';

export const apiErrorSchema = z.object({success: z.literal(false), error: z.string()}).meta({id: 'ApiError'});
export type APIError = z.output<typeof apiErrorSchema>;
export type APISuccess<T> = {success: true; value: T};
export type APIResult<T> = APISuccess<T> | APIError;
export type ErrorStatus = keyof typeof actionErrors extends `${infer Code extends number}` ? Code : never;

export function jsonResponse<Schema extends z.ZodType>(schema: Schema, description: string) {
    return {description, content: {'application/json': {schema}}};
}
export function successResponse<Schema extends z.ZodType>(schema: Schema, description: string) {
    return jsonResponse(z.object({success: z.literal(true), value: schema}), description);
}
export function errorResponse(description: string) {
    return jsonResponse(apiErrorSchema, description);
}
export const actionErrors = {
    '400': errorResponse('Parámetros o contenido inválidos.'),
    '401': errorResponse('Se requiere iniciar sesión.'),
    '403': errorResponse('No tenés permiso para realizar esta operación.'),
    '404': errorResponse('No encontramos el recurso.'),
    '406': errorResponse('El formato de respuesta solicitado no está disponible.'),
    '408': errorResponse('La operación superó el tiempo permitido.'),
    '409': errorResponse('El recurso cambió o entra en conflicto con otro.'),
    '410': errorResponse('El recurso ya no está disponible.'),
    '413': errorResponse('El archivo o contenido supera el tamaño permitido.'),
    '415': errorResponse('Formato de contenido no admitido.'),
    '422': errorResponse('No se pudo procesar el contenido.'),
    '429': {
        ...errorResponse('Se alcanzó el límite de solicitudes. Esperá antes de reintentar.'),
        headers: z.object({'Retry-After': z.string().describe('Segundos que faltan para poder reintentar.')}),
    },
    '500': errorResponse('No pudimos completar la operación.'),
    '503': errorResponse('El servicio no está disponible.'),
};
export const emptySuccess = jsonResponse(z.object({success: z.literal(true)}), 'Operación completada.');
export const emptyValueSuccess = successResponse(z.object({}), 'Operación completada.');
export const pendingResponse = jsonResponse(z.object({success: z.literal(true), pending: z.literal(true), state: z.string()}), 'Preparación o actualización en curso. Reintentá más tarde.');
export const idParams = z.object({id: z.string()});
export const browserSessionSecurity = [{sessionCookie: [] as string[]}];
export const sessionSecurity = [...browserSessionSecurity, {apiToken: [] as string[]}];
export const optionalSessionSecurity = [{}, ...sessionSecurity];

type JsonRequestBody<Schema extends z.ZodType, Required extends boolean> = {
    required: Required;
    content: {'application/json': {schema: Schema}};
};
export function jsonBody<Schema extends z.ZodType>(schema: Schema): JsonRequestBody<Schema, true>;
export function jsonBody<Schema extends z.ZodType, Required extends boolean>(schema: Schema, required: Required): JsonRequestBody<Schema, Required>;
export function jsonBody<Schema extends z.ZodType>(schema: Schema, required = true) {
    return {required, content: {'application/json': {schema}}};
}
export const binaryBody = {required: true, content: {'application/octet-stream': {schema: z.string().meta({format: 'binary'})}}};
export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';
type MediaContent = {content?: Record<string, {schema?: z.ZodType}>};
export type OperationContract = {
    'x-internal'?: boolean;
    'x-display-order'?: number;
    operationId: string;
    summary: string;
    description?: string;
    tags?: string[];
    security?: Record<string, string[]>[];
    requestParams?: {path?: z.ZodType; query?: z.ZodType};
    requestBody?: MediaContent & {required?: boolean};
    responses: Record<string, MediaContent & {description: string}>;
};
export type ApiContract = Record<string, Partial<Record<HttpMethod, OperationContract>>>;

export const resourceListQuerySchema = z.object({
    search: z.string().max(500).optional(),
    topicId: z.string().optional().describe('Filtrar por tema.'),
    preferredTopicId: z.string().optional().describe('Priorizar este tema cuando no hay búsqueda textual.'),
    page: z.string().regex(/^\d{1,9}$/).optional().describe('Página desde 0; por defecto 0.'),
    pageSize: z.string().regex(/^(?:[1-9]\d?|100)$/).optional().describe('Resultados por página: entre 1 y 100; por defecto 12.'),
    includeDeleted: z.enum(['true', 'false']).optional().describe('Incluir bloques eliminados por convergencia; por defecto false.'),
});
export const paginationSchema = z.object({total: z.number(), page: z.number(), pageSize: z.number()});
export type ResourceListQuery = z.output<typeof resourceListQuerySchema>;
