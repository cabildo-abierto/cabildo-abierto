/**
 * API REST de Cabildo Abierto: 60 operaciones (7 del frontend) y una ruta de documentación.
 * Rutas relativas a la raíz del backend, sin prefijo /api.
 *
 * /
 * ├── auth
 * │   ├── login [POST] -- frontend
 * │   ├── logout [POST] -- frontend
 * │   ├── me [GET]
 * │   ├── register [POST] -- frontend
 * │   ├── session [GET] -- frontend
 * │   └── tokens [GET, POST] -- frontend
 * │       └── :id [DELETE] -- frontend
 * ├── datasets [GET]
 * │   ├── :topicId/:blockNumber [GET]
 * │   ├── preview [POST]
 * │   ├── upload [POST] -- cuerpo binario
 * │   └── versions/:id [GET]
 * │       ├── metadata [GET]
 * │       ├── table-page [POST]
 * │       └── update [GET]
 * ├── documents [GET]
 * │   ├── files/:id [GET]
 * │   ├── import [POST]
 * │   ├── upload [POST] -- cuerpo binario
 * │   └── versions/:id [GET]
 * │       ├── blocks/:blockId/comments [GET, POST]
 * │       │   └── :commentId [DELETE]
 * │       ├── file [GET] -- 302 a URL firmada
 * │       └── preview [POST]
 * ├── images
 * │   ├── files/:fileId [GET]
 * │   ├── import [POST]
 * │   └── upload [POST] -- cuerpo binario
 * ├── lcca
 * │   ├── analyze [POST]
 * │   ├── query [POST]
 * │   └── sources [POST]
 * ├── notifications [GET]
 * │   ├── :id/read [PATCH]
 * │   ├── count [GET]
 * │   └── read-all [PATCH]
 * ├── openapi.json [GET] -- contrato generado
 * └── topics [GET, POST]
 *     ├── events [GET] -- SSE; mode opcional registra presencia
 *     ├── search [GET]
 *     └── :id [GET]
 *         ├── blocks [GET]
 *         │   └── :blockNumber [GET]
 *         │       ├── comments [GET, POST]
 *         │       │   └── :commentId [DELETE]
 *         │       └── versions [GET]
 *         │           └── :versionId [DELETE]
 *         │               └── reactions [POST, DELETE]
 *         ├── connections/:connectionId/disconnect [POST]
 *         ├── edits [POST]
 *         └── title-edits [GET]
 *             └── :editId [GET, DELETE]
 *                 ├── comments [GET, POST]
 *                 │   └── :commentId [DELETE]
 *                 └── reactions [POST, DELETE]
 */

/**
 * Los contratos de cada sección definen esquemas Zod, tipos y OpenAPI; el backend
 * selecciona el contrato por método y path. Mantener este mapa al cambiar rutas.
 * La página /api del frontend presenta la referencia generada desde /openapi.json.
 * x-internal excluye una operación de la referencia pública; la validación usa todas.
 *
 * GET topics/:id también acepta slugs y alias; las subrutas usan el ID estable.
 * GET topics lista por actividad; GET topics/search?q= busca en títulos y contenido.
 * Ambos usan offset/limit y el mismo formato de respuesta.
 * La autenticación admite ca_session HttpOnly o Authorization: Bearer ca_…; los
 * tokens personales solo se administran con cookie. Los contratos indican las
 * operaciones protegidas y los middlewares aplican sesión, autoría y permisos.
 * Las queries viajan como strings URL; el validador convierte los tipos declarados.
 * JSON: {success:true,value} o {success:true}; errores: {success:false,error}.
 * Datasets pueden devolver 202 con {success:true,pending:true,state}; se reintenta.
 * El vocabulario de errores es compartido; no todos los estados ocurren en cada ruta.
 *
 * POST topics/:id/edits acepta changes por bloque o title + message, nunca ambos.
 * changes omite los bloques intactos; update/delete comprueban baseVersionId.
 * Uploads: application/octet-stream; documentos y datasets requieren query name.
 * events emite eventos SSE TopicRealtimeEvent; mode=editing requiere sesión.
 * Descargas de documentos redirigen a URLs firmadas; imágenes devuelven URL y expiración.
 */

import {authContract} from './auth';
import {notificationsContract} from './notifications';
import {datasetsContract} from './datasets';
import {lccaContract} from './lcca';
import {imagesContract} from './images';
import {documentsContract} from './documents';
import {topicsContract} from './topics';
import type {HttpMethod, OperationContract} from './common';

export const apiContract = {...topicsContract, ...authContract, ...notificationsContract, ...datasetsContract, ...lccaContract, ...imagesContract, ...documentsContract};

type Contract = typeof apiContract;
export type ApiPath<Method extends HttpMethod> = {
    [Path in keyof Contract]: Method extends keyof Contract[Path] ? Path : never;
}[keyof Contract];

export type ApiOperation<Method extends HttpMethod, Path extends ApiPath<Method>> =
    Extract<Contract[Path][Method & keyof Contract[Path]], OperationContract>;
