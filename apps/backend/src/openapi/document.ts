import {createDocument, type ZodOpenApiPathsObject} from 'zod-openapi';
import {apiContract, topicRealtimeEventSchema} from '@cabildo-abierto/api';

export function createOpenApiDocument({includeInternal = false}: {includeInternal?: boolean} = {}) {
    const paths: ZodOpenApiPathsObject = {};
    for (const [path, operations] of Object.entries(apiContract)) {
        const visible = Object.fromEntries(Object.entries(operations).filter(([, operation]) =>
            includeInternal || !('x-internal' in operation && operation['x-internal'])));
        if (Object.keys(visible).length) paths[path.replace(/:([A-Za-z_]\w*)/g, '{$1}')] = visible;
    }
    return createDocument({
        openapi: '3.1.0',
        info: {
            title: 'Cabildo Abierto API',
            version: '1.0.0',
            description: 'Accedé programáticamente a Cabildo Abierto a través de la API REST.',
        },
        servers: [{url: '/'}],
        paths,
        components: {schemas: {TopicRealtimeEvent: topicRealtimeEventSchema}, securitySchemes: {sessionCookie: {type: 'apiKey', in: 'cookie', name: 'ca_session'}, apiToken: {type: 'http', scheme: 'bearer', description: 'Token personal generado desde la página /api. No admite crear, listar ni revocar tokens.'}}},
    });
}

export type OpenApiDocument = ReturnType<typeof createOpenApiDocument>;
