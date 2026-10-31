export type Schema = {
    $ref?: string;
    type?: string | string[];
    description?: string;
    properties?: Record<string, Schema>;
    required?: string[];
    items?: Schema;
    enum?: unknown[];
    const?: unknown;
    default?: unknown;
    example?: unknown;
    minimum?: number;
    maximum?: number;
    minLength?: number;
    maxLength?: number;
    minItems?: number;
    maxItems?: number;
    pattern?: string;
    format?: string;
    oneOf?: Schema[];
    anyOf?: Schema[];
    allOf?: Schema[];
};

export type Parameter = {
    $ref?: string;
    name: string;
    in: string;
    required?: boolean;
    description?: string;
    example?: unknown;
    schema?: Schema;
};

type Content = Record<string, {schema?: Schema; example?: unknown}>;
export type ApiResponse = {$ref?: string; description: string; content?: Content};
export type RequestBody = {$ref?: string; description?: string; required?: boolean; content?: Content};
export type Operation = {
    operationId?: string;
    'x-display-order'?: number;
    summary?: string;
    description?: string;
    tags?: string[];
    deprecated?: boolean;
    security?: Record<string, string[]>[];
    parameters?: Parameter[];
    requestBody?: RequestBody;
    responses: Record<string, ApiResponse>;
};

export const httpMethods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'] as const;
export type HttpMethod = typeof httpMethods[number];
type PathItem = Partial<Record<HttpMethod, Operation>> & {$ref?: string; parameters?: Parameter[]};
export type ApiDocument = {
    info: {title: string; version: string; description?: string};
    servers?: {url: string}[];
    security?: Record<string, string[]>[];
    tags?: {name: string}[];
    paths: Record<string, PathItem>;
    components?: {
        schemas?: Record<string, Schema>;
        parameters?: Record<string, Parameter>;
        responses?: Record<string, ApiResponse>;
        requestBodies?: Record<string, RequestBody>;
    };
};
export type Endpoint = {method: HttpMethod; path: string; id: string; operation: Operation};

export function resolveReference<T extends {$ref?: string}>(value: T, document: ApiDocument): T {
    let current = value;
    const visited = new Set<string>();
    while (current.$ref?.startsWith('#/') && !visited.has(current.$ref)) {
        visited.add(current.$ref);
        let target: unknown = document;
        for (const part of current.$ref.slice(2).split('/')) {
            const key = decodeURIComponent(part).replace(/~1/g, '/').replace(/~0/g, '~');
            target = target && typeof target === 'object' ? (target as Record<string, unknown>)[key] : undefined;
        }
        if (!target || typeof target !== 'object') break;
        const siblings = {...current};
        delete siblings.$ref;
        current = {...target, ...siblings} as T;
    }
    return current;
}

export function getEndpoints(document: ApiDocument): Endpoint[] {
    const groupOrder = new Map(document.tags?.map((tag, index) => [tag.name, index]));
    return Object.entries(document.paths).flatMap(([path, item]) => {
        const resolved = resolveReference(item, document);
        return httpMethods.flatMap(method => {
            const operation = resolved[method];
            if (!operation) return [];
            const parameters = new Map<string, Parameter>();
            for (const entry of [...(resolved.parameters ?? []), ...(operation.parameters ?? [])]) {
                const parameter = resolveReference(entry, document);
                parameters.set(`${parameter.in}:${parameter.name}`, parameter);
            }
            return [{method, path, id: `${method}:${path}`, operation: {...operation, parameters: [...parameters.values()]}}];
        });
    }).sort((left, right) => {
        const leftGroup = left.operation.tags?.[0] ?? 'General';
        const rightGroup = right.operation.tags?.[0] ?? 'General';
        const groupDifference = (groupOrder.get(leftGroup) ?? Number.MAX_SAFE_INTEGER) - (groupOrder.get(rightGroup) ?? Number.MAX_SAFE_INTEGER);
        if (groupDifference) return groupDifference;
        if (leftGroup !== rightGroup) return leftGroup.localeCompare(rightGroup, 'es');
        return (left.operation['x-display-order'] ?? Number.MAX_SAFE_INTEGER) - (right.operation['x-display-order'] ?? Number.MAX_SAFE_INTEGER);
    });
}

export function schemaType(schema: Schema): string {
    if (schema.type === 'array') return `${schema.items ? schemaType(schema.items) : 'unknown'}[]`;
    if (schema.const !== undefined) return JSON.stringify(schema.const);
    if (schema.oneOf || schema.anyOf) return 'unión';
    if (schema.allOf) return 'composición';
    return Array.isArray(schema.type) ? schema.type.join(' | ') : schema.type ?? (schema.$ref ? 'referencia' : 'objeto');
}

export function schemaConstraints(schema: Schema): string[] {
    return [
        schema.minLength !== undefined ? `Mín. ${schema.minLength} caracteres` : undefined,
        schema.maxLength !== undefined ? `Máx. ${schema.maxLength} caracteres` : undefined,
        schema.minimum !== undefined ? `Mín. ${schema.minimum}` : undefined,
        schema.maximum !== undefined ? `Máx. ${schema.maximum}` : undefined,
        schema.minItems !== undefined ? `Mín. ${schema.minItems} elementos` : undefined,
        schema.maxItems !== undefined ? `Máx. ${schema.maxItems} elementos` : undefined,
        schema.default !== undefined ? `Por defecto: ${JSON.stringify(schema.default)}` : undefined,
        schema.format ? `Formato: ${schema.format}` : undefined,
        schema.pattern ? `Patrón: ${schema.pattern}` : undefined,
    ].filter((value): value is string => value !== undefined);
}
