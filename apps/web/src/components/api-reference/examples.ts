import {resolveReference, type ApiDocument, type Endpoint, type Schema} from './openapi';

export function schemaExample(schema: Schema, document: ApiDocument, depth = 0): unknown {
    const resolved = resolveReference(schema, document);
    if (resolved.example !== undefined) return resolved.example;
    if (resolved.default !== undefined) return resolved.default;
    if (resolved.const !== undefined) return resolved.const;
    if (resolved.enum) return resolved.enum[0];
    if (depth >= 8) return null;
    const variant = resolved.oneOf?.[0] ?? resolved.anyOf?.[0];
    if (variant) return schemaExample(variant, document, depth + 1);
    if (resolved.allOf) {
        const parts = resolved.allOf.map(part => schemaExample(part, document, depth + 1));
        return Object.assign({}, ...parts.filter(part => part !== null && typeof part === 'object' && !Array.isArray(part)));
    }
    if (resolved.properties) return Object.fromEntries(Object.entries(resolved.properties).filter(([, child]) => !('not' in child && Object.keys(child.not ?? {}).length === 0)).map(([name, child]) => [name, schemaExample(child, document, depth + 1)]));
    if (resolved.items) return [schemaExample(resolved.items, document, depth + 1)];
    const type = Array.isArray(resolved.type) ? resolved.type.find(value => value !== 'null') : resolved.type;
    if (type === 'number' || type === 'integer') return resolved.minimum ?? 0;
    if (type === 'boolean') return false;
    if (type === 'null') return null;
    return 'string';
}

export function requestExample(endpoint: Endpoint, document: ApiDocument, baseUrl: string): string {
    let path = endpoint.path;
    const query = new URLSearchParams();
    const success = Object.entries(endpoint.operation.responses).find(([status]) => /^[23]/.test(status));
    const response = success ? resolveReference(success[1], document) : undefined;
    const accept = Object.keys(response?.content ?? {})[0] ?? '*/*';
    const headers = new Map<string, string>([['Accept', accept]]);
    for (const parameter of endpoint.operation.parameters ?? []) {
        const schema = parameter.schema ? resolveReference(parameter.schema, document) : {};
        if (!parameter.required && parameter.example === undefined && schema.example === undefined && schema.default === undefined) continue;
        const value = parameter.example ?? schemaExample(schema, document);
        if (parameter.in === 'path') path = path.replace(`{${parameter.name}}`, encodeURIComponent(String(value)));
        if (parameter.in === 'query') query.set(parameter.name, String(value));
        if (parameter.in === 'header') headers.set(parameter.name, String(value));
    }
    const url = `${baseUrl.replace(/\/$/, '')}${path}${query.size ? `?${query}` : ''}`;
    const lines = [`curl --request ${endpoint.method.toUpperCase()} '${url.replaceAll("'", "'\\''")}'`];
    const security = endpoint.operation.security ?? document.security ?? [];
    const bearer = security.some(requirement => 'apiToken' in requirement);
    const protectedOperation = security.length > 0 && !security.some(requirement => !Object.keys(requirement).length);
    if (bearer && protectedOperation) headers.set('Authorization', 'Bearer $CABILDO_TOKEN');
    if (!bearer && security.some(requirement => 'sessionCookie' in requirement)) lines.push("  --cookie 'cookies.txt'");
    if (['login', 'register'].includes(endpoint.operation.operationId ?? '')) lines.push("  --cookie-jar 'cookies.txt'");
    const body = endpoint.operation.requestBody ? resolveReference(endpoint.operation.requestBody, document) : undefined;
    const media = body?.content?.['application/json'];
    const binary = body?.content?.['application/octet-stream'];
    if (media) headers.set('Content-Type', 'application/json');
    if (binary) headers.set('Content-Type', 'application/octet-stream');
    for (const [name, value] of headers) {
        if (name === 'Authorization') lines.push('  --header "Authorization: Bearer $CABILDO_TOKEN"');
        else lines.push(`  --header '${name}: ${value.replaceAll("'", "'\\''")}'`);
    }
    if (media?.schema) {
        const example = JSON.stringify(media.example ?? schemaExample(media.schema, document));
        lines.push(`  --data '${example.replaceAll("'", "'\\''")}'`);
    }
    if (binary) lines.push("  --data-binary '@archivo'");
    return lines.join(' \\\n');
}
