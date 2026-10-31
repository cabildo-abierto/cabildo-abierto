import {z} from 'zod';
import {actionErrors, idParams, emptySuccess, jsonBody, optionalSessionSecurity, sessionSecurity, errorResponse, successResponse, type ApiContract} from './common';
import {publicUserSchema} from './auth';

export const topicSummarySchema = z.object({
    id: z.string().describe('Identificador del tema.'),
    slug: z.string().describe('Nombre del tema en la URL.'),
    title: z.string().describe('Título del tema.'),
    visibility: z.enum(['public', 'private']).optional(),
    role: z.enum(['member', 'admin']).nullable().optional(),
}).meta({id: 'TopicSummary'});

export const blockTypeIdSchema = z.enum(['parrafo', 'h1', 'h2', 'imagen', 'documento', 'dataset', 'visualizacion', 'tabla']);

export const topicBlockSchema = z.object({
    id: z.string(),
    blockNumber: z.string().describe('Número estable del bloque dentro del tema.'),
    typeId: blockTypeIdSchema,
    content: z.string().describe('Contenido serializado del bloque. Su formato depende de typeId.'),
    order: z.string().describe('Clave de orden del bloque.'),
    commentCount: z.number(),
}).meta({id: 'TopicBlock'});

export const blockTypeSchema = z.object({id: blockTypeIdSchema, name: z.string()});
export const topicParams = z.object({id: z.string().describe('Identificador del tema (no su slug).')});
export const topicMatchSchema = z.object({
    entryId: z.string(),
    kind: z.enum(['block_version', 'topic_title', 'comment', 'document_file', 'dataset']),
    blockType: blockTypeIdSchema.nullable(),
    versionId: z.string().nullable(),
    commentId: z.string().nullable(),
    comment: z.object({author: publicUserSchema, createdAt: z.string()}).nullable(),
    attachmentTitle: z.string().nullable(),
    historical: z.boolean(),
    snippet: z.object({text: z.string(), highlights: z.array(z.object({start: z.number(), end: z.number()}))}),
});
export const connectionCountsSchema = z.object({reading: z.number(), editing: z.number()});
export const topicListSchema = z.object({
    results: z.array(z.object({
        topic: topicSummarySchema,
        connections: connectionCountsSchema,
        matchCount: z.number().describe('Cantidad total de coincidencias en el tema; 0 sin búsqueda.'),
        matches: z.array(topicMatchSchema).max(1).describe('Mejor coincidencia del tema para mostrar como resumen; vacío sin búsqueda.'),
    })),
    totalTopics: z.number(),
    totalMatches: z.number(),
    offset: z.number(),
    limit: z.number(),
});
export const topicOutputSchema = z.object({topic: topicSummarySchema});
export const readingBlockSchema = topicBlockSchema.extend({deleted: z.boolean()}).meta({id: 'TopicReadingBlock'});
export const topicBlockOutputSchema = z.object({block: readingBlockSchema});
export const attachmentSummarySchema = z.object({count: z.number(), deletedCount: z.number(), revision: z.string()});
export const topicBlocksSchema = z.object({
    blocks: z.array(readingBlockSchema),
    deletedBlocks: z.array(readingBlockSchema),
    footnoteAttachments: z.array(readingBlockSchema),
    attachments: z.object({documento: attachmentSummarySchema, dataset: attachmentSummarySchema}),
    blockTypes: z.array(blockTypeSchema),
});


const searchBlockTypesPattern = blockTypeIdSchema.options.join('|');
export const topicListQuerySchema = z.object({
    offset: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).default(0).describe('Cantidad de temas que se omiten para paginar.'),
    limit: z.number().int().min(1).max(50).default(20).describe('Cantidad máxima de temas por página.'),
});
export const topicSearchQuerySchema = topicListQuerySchema.extend({
    q: z.string().min(1).max(500).regex(/\S/).meta({example: 'educación', param: {allowReserved: true}})
        .describe('Texto para buscar en títulos y contenido. Se eliminan espacios al inicio y al final.'),
    types: z.string().regex(new RegExp(`^((${searchBlockTypesPattern})(,(${searchBlockTypesPattern}))*)?$`))
        .optional().meta({param: {allowReserved: true}}).describe('Tipos de bloque separados por comas para filtrar la búsqueda. Si se omite, busca en todos.'),
    history: z.enum(['true', 'false']).default('true').describe('Incluir versiones históricas en la búsqueda.'),
    comments: z.enum(['true', 'false']).default('true').describe('Incluir comentarios en la búsqueda.'),
});

const invalidParameters = errorResponse('Los parámetros de la solicitud no son válidos.');

export const titleEditSchema = z.object({
    id: z.string(), topic: topicSummarySchema, title: z.string(), slug: z.string(), message: z.string().nullable(), initial: z.boolean(),
    createdAt: z.string(), author: publicUserSchema, status: z.enum(['current', 'accepted', 'rejected', 'deleted']),
    acceptCount: z.number(), rejectCount: z.number(), replicatedRejectCount: z.number(), commentCount: z.number(),
    userReaction: z.enum(['accept', 'reject']).nullable(),
}).meta({id: 'TopicTitleEdit'});
export const createTitleEditSchema = z.object({title: z.string(), message: z.string()});
export const titleEditOutputSchema = z.object({edit: titleEditSchema});
export const titleEditsOutputSchema = z.object({edits: z.array(titleEditSchema), nextCursor: z.string().nullable()});

export const topicBlockVersionSchema = topicBlockSchema.extend({
    editId: z.string(), deleted: z.boolean(), createdAt: z.string(), message: z.string().nullable(), rejected: z.boolean(), current: z.boolean(),
    acceptCount: z.number(), rejectCount: z.number(), replicatedRejectCount: z.number(), userReaction: z.enum(['accept', 'reject']).nullable(), author: publicUserSchema,
});
export const topicBlockVersionsSchema = z.object({versions: z.array(topicBlockVersionSchema)});
export const topicBlockChangeSchema = z.discriminatedUnion('action', [
    z.object({action: z.literal('create'), localId: z.string().regex(/^new-[0-9a-fA-F-]{36}$/).meta({example: 'new-00000000-0000-4000-8000-000000000000'}), typeId: blockTypeIdSchema, content: z.string(), order: z.string()}),
    z.object({action: z.literal('update'), blockNumber: z.string(), baseVersionId: z.string(), typeId: blockTypeIdSchema, content: z.string(), order: z.string(), deleted: z.boolean().optional()}),
    z.object({action: z.literal('delete'), blockNumber: z.string(), baseVersionId: z.string()}),
]);
export const saveTopicEditSchema = z.object({changes: z.array(topicBlockChangeSchema).min(1), message: z.string().nullable().optional(), title: z.never().optional(), blocks: z.never().optional(), baseBlocks: z.never().optional()});
export const saveTopicEditOutputSchema = topicBlocksSchema;
export const createTopicSchema = z.object({
    title: z.string(),
    visibility: z.enum(['public', 'private']).default('public'),
    privateKey: z.string().regex(/^[0-9a-f]{12}$/).optional().describe('Sufijo de la URL privada. Si se omite, se genera automáticamente.'),
});
const editBodySchema = z.union([saveTopicEditSchema, createTitleEditSchema.extend({changes: z.never().optional(), blocks: z.never().optional(), baseBlocks: z.never().optional()})]);

export const blockCommentSchema = z.object({
    id: z.string(), commentNumber: z.string(), blockVersionId: z.string(), rootId: z.string(), replyToId: z.string(),
    directReplyCount: z.number(), rejection: z.boolean(), suggestedVote: z.enum(['accept', 'reject']).nullable(),
    replicaDepth: z.number().nullable(), deleted: z.boolean(), content: z.string(), createdAt: z.string(), author: publicUserSchema,
}).meta({id: 'BlockComment'});
export const discussionCommentSchema = blockCommentSchema.omit({blockVersionId: true}).meta({id: 'DiscussionComment'});
export const blockCommentsSchema = z.object({comments: z.array(blockCommentSchema)});
export const blockCommentOutputSchema = z.object({comment: blockCommentSchema});
export const discussionCommentsSchema = z.object({comments: z.array(discussionCommentSchema)});
export const commentInputSchema = z.object({content: z.string(), replyToId: z.string().optional(), reject: z.boolean().optional(), replica: z.boolean().optional()});
export const blockCommentInputSchema = commentInputSchema.extend({blockVersionId: z.string()});
export const createReactionSchema = z.object({type: z.literal('accept'), deleteReason: z.boolean().optional()});
export const deleteReactionSchema = z.object({deleteReason: z.boolean().optional()});
const blockParams = z.object({id: z.string(), blockNumber: z.string()});
const titleParams = z.object({id: z.string(), editId: z.string()});
const blockReactionParams = blockParams.extend({versionId: z.string()});
export type DiscussionComment = z.output<typeof discussionCommentSchema>;
export type DiscussionCommentsOutput = z.output<typeof discussionCommentsSchema>;
export type CreateDiscussionCommentInput = z.output<typeof commentInputSchema>;
export type BlockComment = z.output<typeof blockCommentSchema>;
export type BlockCommentsOutput = z.output<typeof blockCommentsSchema>;
export type CreateBlockCommentInput = z.output<typeof blockCommentInputSchema>;
export type CreateBlockReactionInput = z.output<typeof createReactionSchema>;
export type DeleteBlockReactionInput = z.output<typeof deleteReactionSchema>;
export type CreateBlockCommentOutput = z.output<typeof blockCommentOutputSchema>;
export const connectionModeSchema = z.enum(['reading', 'editing']);
export const topicEventsQuerySchema = z.object({
    ids: z.string().max(2048).regex(/^[^,\s]+(?:,[^,\s]+){0,49}$/).meta({param: {allowReserved: true}})
        .describe('Hasta 50 identificadores de temas separados por comas.'),
    mode: connectionModeSchema.optional().describe('Registra presencia en un único tema. editing requiere sesión.'),
});
export const topicChangedSourceSchema = z.enum(['edit', 'comment', 'vote', 'title']);
export const topicRealtimeEventSchema = z.discriminatedUnion('type', [
    z.object({type: z.literal('access.revoked'), topicId: z.string()}),
    z.object({type: z.literal('connections.changed'), topicId: z.string(), connections: connectionCountsSchema}),
    z.object({type: z.literal('connection.opened'), topicId: z.string(), connectionId: z.string()}),
    z.object({type: z.literal('topic.changed'), topicId: z.string(), source: topicChangedSourceSchema}),
]).meta({id: 'TopicRealtimeEvent'});
const disconnectParams = z.object({id: z.string(), connectionId: z.string()});
export type TopicConnectionMode = z.output<typeof connectionModeSchema>;
export type TopicConnectionCounts = z.output<typeof connectionCountsSchema>;
export type TopicConnectionsChangedEvent = Extract<z.output<typeof topicRealtimeEventSchema>, {type: "connections.changed"}>;
export type TopicConnectionOpenedEvent = Extract<z.output<typeof topicRealtimeEventSchema>, {type: "connection.opened"}>;
export type TopicChangedEvent = Extract<z.output<typeof topicRealtimeEventSchema>, {type: "topic.changed"}>;
export type TopicRealtimeEvent = z.output<typeof topicRealtimeEventSchema>;

export const topicRoleSchema = z.enum(['member', 'admin']);
export const topicInvitationStatusSchema = z.enum(['pending', 'accepted', 'declined', 'cancelled']);
export const topicMemberSchema = z.object({user: publicUserSchema, role: topicRoleSchema});
export const topicInvitationSchema = z.object({id: z.string(), recipient: publicUserSchema, role: topicRoleSchema,
    status: topicInvitationStatusSchema, createdAt: z.string()});
export const topicAccessSchema = z.object({members: z.array(topicMemberSchema), invitations: z.array(topicInvitationSchema)});
export const topicInvitationCandidatesSchema = z.object({users: z.array(publicUserSchema)});
export type TopicInvitationCandidates = z.output<typeof topicInvitationCandidatesSchema>;
export type TopicAccess = z.output<typeof topicAccessSchema>;
export type TopicRole = z.output<typeof topicRoleSchema>;
const invitationParams = topicParams.extend({invitationId: z.string().uuid()});
const memberParams = topicParams.extend({userId: z.string()});

export const topicsContract = {
    '/topics/:id/members': {get: {operationId: 'getTopicMembers', 'x-display-order': 10, summary: 'Consultar accesos al tema', tags: ['Accesos'], security: sessionSecurity,
        requestParams: {path: topicParams}, responses: {...actionErrors, '200': successResponse(topicAccessSchema, 'Miembros e invitaciones.')}}},
    '/topics/:id/members/:userId': {
        patch: {operationId: 'changeTopicMemberRole', 'x-display-order': 60, summary: 'Cambiar rol de un miembro', tags: ['Accesos'], security: sessionSecurity,
            requestParams: {path: memberParams}, requestBody: jsonBody(z.object({role: topicRoleSchema})), responses: {...actionErrors, '200': emptySuccess}},
        delete: {operationId: 'removeTopicMember', 'x-display-order': 70, summary: 'Quitar acceso al tema', tags: ['Accesos'], security: sessionSecurity,
            requestParams: {path: memberParams}, responses: {...actionErrors, '200': emptySuccess}}},
    '/topics/:id/invitations/candidates': {get: {operationId: 'searchTopicInvitationCandidates', 'x-display-order': 20, summary: 'Buscar usuarios para invitar', tags: ['Accesos'], security: sessionSecurity,
        requestParams: {path: topicParams, query: z.object({q: z.string().trim().min(2).max(30)})},
        responses: {...actionErrors, '200': successResponse(topicInvitationCandidatesSchema, 'Hasta 10 usuarios sin acceso ni invitación pendiente.')}}},
    '/topics/:id/invitations': {post: {operationId: 'inviteTopicMember', 'x-display-order': 30, summary: 'Invitar a un tema privado', tags: ['Accesos'], security: sessionSecurity,
        requestParams: {path: topicParams}, requestBody: jsonBody(z.object({username: z.string().min(1).max(100), role: topicRoleSchema})),
        responses: {...actionErrors, '201': successResponse(topicInvitationSchema, 'Invitación enviada.')}}},
    '/topics/:id/invitations/:invitationId': {delete: {operationId: 'cancelTopicInvitation', 'x-display-order': 80, summary: 'Cancelar una invitación', tags: ['Accesos'], security: sessionSecurity,
        requestParams: {path: invitationParams}, responses: {...actionErrors, '200': emptySuccess}}},
    '/topics/:id/invitations/:invitationId/accept': {post: {operationId: 'acceptTopicInvitation', 'x-display-order': 40, summary: 'Aceptar una invitación', tags: ['Accesos'], security: sessionSecurity,
        requestParams: {path: invitationParams}, responses: {...actionErrors, '200': emptySuccess}}},
    '/topics/:id/invitations/:invitationId/decline': {post: {operationId: 'declineTopicInvitation', 'x-display-order': 50, summary: 'Rechazar una invitación', tags: ['Accesos'], security: sessionSecurity,
        requestParams: {path: invitationParams}, responses: {...actionErrors, '200': emptySuccess}}},
    '/topics': {
        post: {operationId: 'createTopic', 'x-display-order': 60, summary: 'Crear un tema', tags: ['Temas'], security: sessionSecurity,
            requestBody: jsonBody(createTopicSchema), responses: {...actionErrors, '201': successResponse(topicOutputSchema, 'Tema creado.')}},
        get: {
            operationId: 'listTopics', 'x-display-order': 10,
            tags: ['Temas'],
            summary: 'Listar temas',
            description: 'Lista los temas por actividad: participantes de los últimos siete días, actividad total y antigüedad.',
            requestParams: {query: topicListQuerySchema},
            responses: {
                ...actionErrors,
                '200': successResponse(topicListSchema, 'Temas paginados, sin coincidencias de búsqueda.'),
                '400': invalidParameters,
                '500': errorResponse('No pudimos buscar los temas.'),
            },
        },
    },
    '/topics/search': {get: {
        operationId: 'searchTopics', 'x-display-order': 20, tags: ['Temas'], summary: 'Buscar temas',
        description: 'Busca en títulos, bloques, comentarios, documentos y datasets. Ordena por relevancia priorizando los títulos de temas. Cada tema incluye un resumen de su mejor coincidencia.',
        requestParams: {query: topicSearchQuerySchema},
        responses: {...actionErrors, '200': successResponse(topicListSchema, 'Temas paginados con sus coincidencias.'),
            '400': errorResponse('La búsqueda o sus filtros no son válidos.'), '500': errorResponse('No pudimos buscar los temas.')},
    }},
    '/topics/:id': {
        get: {
            operationId: 'getTopic', 'x-display-order': 30,
            tags: ['Temas'],
            summary: 'Obtener un tema',
            description: 'Acepta el identificador, el slug actual o un alias histórico del tema. Devuelve su identificador estable, título y slug actual; usá el identificador devuelto en las demás rutas del tema.',
            requestParams: {path: z.object({id: z.string().describe('Identificador, slug actual o alias histórico del tema.')})},
            responses: {
                ...actionErrors,
                '200': successResponse(topicOutputSchema, 'Información del tema.'),
                '400': invalidParameters,
                '404': errorResponse('No encontramos ese tema.'),
                '500': errorResponse('No pudimos cargar el tema.'),
            },
        },
    },
    '/topics/:id/blocks': {
        get: {
            operationId: 'getTopicBlocks', 'x-display-order': 40,
            tags: ['Temas'],
            summary: 'Consultar los bloques de un tema',
            description: 'Devuelve el contenido principal, los bloques eliminados, los adjuntos citados en notas, resúmenes de documentos y datasets y los tipos de bloque. Los demás adjuntos se consultan con paginación en /documents y /datasets.',
            requestParams: {path: topicParams},
            responses: {
                ...actionErrors,
                '200': successResponse(topicBlocksSchema, 'Bloques y tipos disponibles.'),
                '400': invalidParameters,
                '500': errorResponse('No pudimos cargar los bloques.'),
            },
        },
    },
    '/topics/:id/blocks/:blockNumber': {get: {operationId: 'getTopicBlock', 'x-display-order': 50, summary: 'Obtener un bloque del tema', tags: ['Temas'],
        requestParams: {path: z.object({id: z.string(), blockNumber: z.string()})}, responses: {...actionErrors, '200': successResponse(topicBlockOutputSchema, 'Versión seleccionada por convergencia, incluso si está eliminada.')}}},
    '/topics/:id/blocks/:blockNumber/versions': {get: {operationId: 'getBlockVersions', 'x-display-order': 80, summary: 'Consultar el historial de un bloque', tags: ['Temas'], security: optionalSessionSecurity,
        requestParams: {path: z.object({id: z.string(), blockNumber: z.string()})}, responses: {...actionErrors, '200': successResponse(topicBlockVersionsSchema, 'Historial de versiones.')}}},
    '/topics/:id/blocks/:blockNumber/versions/:versionId': {delete: {operationId: 'deleteBlockVersion', 'x-display-order': 90, summary: 'Eliminar una versión de bloque', tags: ['Temas'], security: sessionSecurity,
        requestParams: {path: z.object({id: z.string(), blockNumber: z.string(), versionId: z.string()})}, responses: {...actionErrors, '200': emptySuccess}}},
    '/topics/:id/edits': {post: {operationId: 'createTopicEdit', 'x-display-order': 70, summary: 'Publicar una edición', tags: ['Temas'], security: sessionSecurity,
        description: 'Enviá changes con operaciones create, update o delete. Los bloques omitidos no cambian; update y delete requieren baseVersionId para detectar conflictos. También acepta title y message para proponer un título, sin changes.',
        requestParams: {path: topicParams}, requestBody: jsonBody(editBodySchema),
        responses: {...actionErrors, '201': successResponse(z.union([saveTopicEditOutputSchema, titleEditOutputSchema]), 'Edición publicada.')}}},
    '/topics/:id/title-edits': {get: {operationId: 'getTitleEdits', 'x-display-order': 10, summary: 'Listar cambios de título', tags: ['Títulos'], security: optionalSessionSecurity,
        requestParams: {path: z.object({id: z.string()}), query: z.object({cursor: z.string().optional().describe('Cursor opaco de la página anterior.')})},
        responses: {...actionErrors, '200': successResponse(titleEditsOutputSchema, 'Página de cambios de título.')}}},
    '/topics/:id/title-edits/:editId': {
        get: {operationId: 'getTitleEdit', 'x-display-order': 20, summary: 'Obtener un cambio de título', tags: ['Títulos'], security: optionalSessionSecurity,
            requestParams: {path: z.object({id: z.string(), editId: z.string()})}, responses: {...actionErrors, '200': successResponse(titleEditOutputSchema, 'Cambio de título.')}},
        delete: {operationId: 'deleteTitleEdit', 'x-display-order': 30, summary: 'Eliminar un cambio de título', tags: ['Títulos'], security: sessionSecurity,
            requestParams: {path: z.object({id: z.string(), editId: z.string()})}, responses: {...actionErrors, '200': emptySuccess}},
    },

    '/topics/:id/blocks/:blockNumber/comments': {
        get: {operationId: 'getBlockComments', 'x-display-order': 10, summary: 'Listar comentarios de un bloque', tags: ['Discusiones'], requestParams: {path: blockParams},
            responses: {...actionErrors, '200': successResponse(blockCommentsSchema, 'Comentarios del bloque.')}},
        post: {operationId: 'createBlockComment', 'x-display-order': 20, summary: 'Comentar un bloque', tags: ['Discusiones'], security: sessionSecurity,
            requestParams: {path: blockParams}, requestBody: jsonBody(blockCommentInputSchema),
            responses: {...actionErrors, '201': successResponse(blockCommentOutputSchema, 'Comentario publicado.')}},
    },
    '/topics/:id/blocks/:blockNumber/comments/:commentId': {delete: {
        operationId: 'deleteBlockComment', 'x-display-order': 50, summary: 'Eliminar un comentario de bloque', tags: ['Discusiones'], security: sessionSecurity,
        requestParams: {path: blockParams.extend({commentId: z.string()})}, responses: {...actionErrors, '200': emptySuccess},
    }},
    '/topics/:id/blocks/:blockNumber/versions/:versionId/reactions': {
        post: {operationId: 'acceptBlockVersion', 'x-display-order': 30, summary: 'Aceptar una versión de bloque', tags: ['Discusiones'], security: sessionSecurity,
            requestParams: {path: blockReactionParams}, requestBody: jsonBody(createReactionSchema), responses: {...actionErrors, '201': emptySuccess}},
        delete: {operationId: 'cancelBlockReaction', 'x-display-order': 40, summary: 'Retirar una reacción de bloque', tags: ['Discusiones'], security: sessionSecurity,
            requestParams: {path: blockReactionParams}, requestBody: jsonBody(deleteReactionSchema, false), responses: {...actionErrors, '200': emptySuccess}},
    },
    '/topics/:id/title-edits/:editId/comments': {
        get: {operationId: 'getTitleComments', 'x-display-order': 60, summary: 'Listar comentarios de un título', tags: ['Discusiones'], security: optionalSessionSecurity,
            requestParams: {path: titleParams}, responses: {...actionErrors, '200': successResponse(discussionCommentsSchema, 'Comentarios del cambio de título.')}},
        post: {operationId: 'createTitleComment', 'x-display-order': 70, summary: 'Comentar un cambio de título', tags: ['Discusiones'], security: sessionSecurity,
            requestParams: {path: titleParams}, requestBody: jsonBody(commentInputSchema), responses: {...actionErrors, '201': successResponse(z.object({comment: discussionCommentSchema}), 'Comentario publicado.')}},
    },
    '/topics/:id/title-edits/:editId/comments/:commentId': {delete: {
        operationId: 'deleteTitleComment', 'x-display-order': 100, summary: 'Eliminar un comentario de título', tags: ['Discusiones'], security: sessionSecurity,
        requestParams: {path: titleParams.extend({commentId: z.string()})}, responses: {...actionErrors, '200': emptySuccess},
    }},
    '/topics/:id/title-edits/:editId/reactions': {
        post: {operationId: 'acceptTitleEdit', 'x-display-order': 80, summary: 'Aceptar un cambio de título', tags: ['Discusiones'], security: sessionSecurity,
            requestParams: {path: titleParams}, requestBody: jsonBody(createReactionSchema), responses: {...actionErrors, '201': emptySuccess}},
        delete: {operationId: 'cancelTitleReaction', 'x-display-order': 90, summary: 'Retirar una reacción de título', tags: ['Discusiones'], security: sessionSecurity,
            requestParams: {path: titleParams}, requestBody: jsonBody(deleteReactionSchema, false), responses: {...actionErrors, '200': emptySuccess}},
    },

    '/topics/events': {get: {operationId: 'subscribeTopicEvents', 'x-display-order': 10, summary: 'Suscribirse a eventos de temas', tags: ['Tiempo real'], security: optionalSessionSecurity,
        description: 'Sin mode observa eventos. Con mode registra presencia en un único tema; editing requiere sesión.',
        requestParams: {query: topicEventsQuerySchema},
        responses: {...actionErrors, '200': {description: 'Stream SSE con connection.opened, connections.changed, topic.changed y access.revoked.', content: {'text/event-stream': {schema: z.string().describe('Mensajes SSE; cada data contiene un JSON que cumple el esquema TopicRealtimeEvent.')}}}}}},
    '/topics/:id/connections/:connectionId/disconnect': {post: {operationId: 'disconnectTopicBeacon', 'x-display-order': 20, summary: 'Cerrar una conexión mediante beacon', tags: ['Tiempo real'], security: optionalSessionSecurity,
        requestParams: {path: disconnectParams}, responses: {...actionErrors, '200': emptySuccess}}},
} satisfies ApiContract;

export type TopicTitleEdit = z.output<typeof titleEditSchema>;
export type CreateTopicTitleEditInput = z.output<typeof createTitleEditSchema>;
export type TopicTitleEditOutput = z.output<typeof titleEditOutputSchema>;
export type TopicTitleEditsOutput = z.output<typeof titleEditsOutputSchema>;
export type TopicSummary = z.output<typeof topicSummarySchema>;
export type CreateTopicInput = z.output<typeof createTopicSchema>;
export type CreateTopicOutput = z.output<typeof topicOutputSchema>;
export type TopicListOutput = z.output<typeof topicListSchema>;
export type TopicListResult = TopicListOutput['results'][number];
export type TopicMatch = z.output<typeof topicMatchSchema>;
export type SearchSourceKind = TopicMatch['kind'];
export type SearchSnippet = TopicMatch['snippet'];
export type TopicOutput = z.output<typeof topicOutputSchema>;
export type BlockType = z.output<typeof blockTypeSchema>;
export type TopicBlock = z.output<typeof topicBlockSchema>;
export type TopicBlocksOutput = z.output<typeof topicBlocksSchema>;
export type TopicEditableBlock = z.output<typeof readingBlockSchema>;
export type TopicAttachmentSummary = z.output<typeof attachmentSummarySchema>;
export type TopicBlockVersion = z.output<typeof topicBlockVersionSchema>;
export type TopicBlockVersionsOutput = z.output<typeof topicBlockVersionsSchema>;
export type SaveTopicEditInput = z.output<typeof saveTopicEditSchema>;
export type SaveTopicEditOutput = z.output<typeof saveTopicEditOutputSchema>;

export type TopicBlockChange = z.output<typeof topicBlockChangeSchema>;

export type TopicBlockOutput = z.output<typeof topicBlockOutputSchema>;
