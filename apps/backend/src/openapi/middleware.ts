import type {ErrorRequestHandler} from 'express';
import {error as validationErrors, middleware} from 'express-openapi-validator';
import type {Logger} from '#/utils/logger.js';
import type {OpenApiDocument} from './document.js';

export function openApiValidation(openApiDocument: OpenApiDocument) {
    return middleware({
        // Both libraries describe OpenAPI 3.1 with different TypeScript types.
        // The validator also validates the generated document at initialization.
        apiSpec: openApiDocument as NonNullable<Parameters<typeof middleware>[0]['apiSpec']>,
        ignoreUndocumented: true,
        validateRequests: {allowUnknownQueryParameters: true},
        validateResponses: true,
        // Session middleware resolves and enforces the cookie declared in OpenAPI.
        validateSecurity: false,
    });
}

export function createOpenApiErrorHandler(logger: Logger): ErrorRequestHandler {
    return (error, req, res, next) => {
        if (error instanceof validationErrors.InternalServerError) {
            logger.pino.error({error}, 'OpenAPI response validation failed');
            res.status(500).json({success: false, error: 'No pudimos completar la solicitud.'});
        } else if (error instanceof validationErrors.BadRequest) {
            res.status(400).json({success: false, error: req.method === 'GET' && req.path === '/topics/search'
                ? 'La búsqueda o sus filtros no son válidos.'
                : 'Los parámetros de la solicitud no son válidos.'});
        } else if (error instanceof validationErrors.UnsupportedMediaType) {
            res.status(415).json({success: false, error: 'El formato del contenido no es válido.'});
        } else if (error instanceof validationErrors.RequestEntityTooLarge) {
            res.status(413).json({success: false, error: 'El contenido supera el tamaño permitido.'});
        } else if (error instanceof validationErrors.NotAcceptable) {
            res.status(406).json({success: false, error: 'El formato de respuesta solicitado no está disponible.'});
        } else {
            next(error);
        }
    };
}
