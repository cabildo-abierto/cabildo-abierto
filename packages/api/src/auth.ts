import {z} from 'zod';
import {actionErrors, browserSessionSecurity, emptyValueSuccess, jsonBody, sessionSecurity, successResponse, type ApiContract} from './common';

export const publicUserSchema = z.object({id: z.string(), username: z.string()}).meta({id: 'PublicUser'});
export const registerInputSchema = z.object({username: z.string(), email: z.string(), password: z.string().meta({format: 'password'})});
export const loginInputSchema = z.object({identifier: z.string(), password: z.string().meta({format: 'password'})});
export const authOutputSchema = z.object({user: publicUserSchema});
export const sessionOutputSchema = z.object({user: publicUserSchema.nullable()});

export const apiTokenSchema = z.object({id: z.string().uuid(), name: z.string(), prefix: z.string(), createdAt: z.string().datetime(), expiresAt: z.string().datetime()});
export const createApiTokenSchema = z.object({name: z.string().trim().min(1).max(80), expiresInDays: z.number().int().min(1).max(90).default(30)});
export const createdApiTokenSchema = apiTokenSchema.extend({token: z.string().meta({format: 'password'})});
export const apiTokenListSchema = z.object({tokens: z.array(apiTokenSchema)});

export const authContract = {
    '/auth/tokens': {
        get: {'x-internal': true, operationId: 'listApiTokens', 'x-display-order': 70, summary: 'Listar tus tokens de API', tags: ['Autenticación'], security: browserSessionSecurity,
            description: 'Requiere la cookie de sesión del sitio. Devuelve metadatos; nunca vuelve a mostrar los secretos.',
            responses: {...actionErrors, '200': successResponse(apiTokenListSchema, 'Tokens personales, incluidos los vencidos.')}},
        post: {'x-internal': true, operationId: 'createApiToken', 'x-display-order': 60, summary: 'Generar un token de API', tags: ['Autenticación'], security: browserSessionSecurity,
            description: 'Requiere la cookie de sesión del sitio. El token permite actuar con los permisos de tu cuenta y se muestra solo en esta respuesta. Vence a los 30 días por defecto, con un máximo de 90 días.',
            requestBody: jsonBody(createApiTokenSchema), responses: {...actionErrors, '201': successResponse(createdApiTokenSchema, 'Token generado. Guardá el secreto antes de cerrar esta vista.')}},
    },
    '/auth/tokens/:id': {delete: {'x-internal': true, operationId: 'revokeApiToken', 'x-display-order': 80, summary: 'Revocar un token de API', tags: ['Autenticación'], security: browserSessionSecurity,
        description: 'Requiere la cookie de sesión del sitio. Solo permite revocar tokens propios.',
        requestParams: {path: z.object({id: z.string().uuid()})}, responses: {...actionErrors, '200': emptyValueSuccess}}},
    '/auth/register': {post: {'x-internal': true, operationId: 'register', 'x-display-order': 30, summary: 'Crear una cuenta', tags: ['Autenticación'],
        description: 'Crea una cuenta e inicia una sesión mediante una cookie HttpOnly. El usuario se normaliza a minúsculas; debe tener de 3 a 30 caracteres. La contraseña debe tener de 8 a 128 caracteres.',
        requestBody: jsonBody(registerInputSchema), responses: {...actionErrors, '201': successResponse(authOutputSchema, 'Cuenta y sesión creadas.')}}},
    '/auth/login': {post: {'x-internal': true, operationId: 'login', 'x-display-order': 20, summary: 'Iniciar sesión', tags: ['Autenticación'],
        description: 'Acepta nombre de usuario o correo y devuelve la cookie de sesión.', requestBody: jsonBody(loginInputSchema),
        responses: {...actionErrors, '200': successResponse(authOutputSchema, 'Sesión iniciada.')}}},
    '/auth/session': {get: {'x-internal': true, operationId: 'getSession', 'x-display-order': 40, summary: 'Consultar la sesión actual', tags: ['Autenticación'], security: [{}, ...browserSessionSecurity],
        responses: {...actionErrors, '200': successResponse(sessionOutputSchema, 'Usuario actual, o null para visitantes.')}}},
    '/auth/logout': {post: {'x-internal': true, operationId: 'logout', 'x-display-order': 50, summary: 'Cerrar sesión', tags: ['Autenticación'], security: [{}, ...browserSessionSecurity],
        description: 'Cierra la sesión del navegador. Los tokens de API se revocan desde /auth/tokens/:id.',
        responses: {...actionErrors, '200': emptyValueSuccess}}},
    '/auth/me': {get: {operationId: 'getCurrentUser', 'x-display-order': 10, summary: 'Consultar tu cuenta', tags: ['Autenticación'], security: sessionSecurity,
        description: 'Devuelve la cuenta autenticada mediante tu token de API o sesión del sitio.',
        responses: {...actionErrors, '200': successResponse(authOutputSchema, 'Cuenta autenticada.')}}},
} satisfies ApiContract;

export type PublicUser = z.output<typeof publicUserSchema>;
export type RegisterInput = z.output<typeof registerInputSchema>;
export type LoginInput = z.output<typeof loginInputSchema>;
export type AuthOutput = z.output<typeof authOutputSchema>;
export type SessionOutput = z.output<typeof sessionOutputSchema>;

export type ApiToken = z.output<typeof apiTokenSchema>;
export type CreateApiTokenInput = z.input<typeof createApiTokenSchema>;
export type CreatedApiToken = z.output<typeof createdApiTokenSchema>;
export type ApiTokenListOutput = z.output<typeof apiTokenListSchema>;
