import express from 'express';
import type {OpenApiDocument} from '../openapi/document.js';

export function documentationRoutes(openApiDocument: OpenApiDocument): express.Router {
    const router = express.Router();
    router.get('/openapi.json', (_req, res) => res.json(openApiDocument));
    return router;
}
