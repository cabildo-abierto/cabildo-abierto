import {cn} from '@/lib/utils';
import {CodeExample} from './code-example';
import {ApiTokenPanel} from './api-token-panel';
import {Parameters} from './parameters';
import {Responses} from './responses';
import {SchemaFields} from './schema-fields';
import {requestExample} from './examples';
import {resolveReference, type ApiDocument, type Endpoint} from './openapi';

export function OperationReference({endpoint, document, baseUrl}: {endpoint: Endpoint; document: ApiDocument; baseUrl: string}) {
    const {operation, method, path, id} = endpoint;
    const body = operation.requestBody ? resolveReference(operation.requestBody, document) : undefined;
    const security = operation.security ?? document.security ?? [];
    const requiresAuthentication = security.length > 0 && !security.some(requirement => !Object.keys(requirement).length);
    const credentialNames: Record<string, string> = {sessionCookie: 'cookie de sesión', apiToken: 'token de API'};
    const credentials = security.filter(requirement => Object.keys(requirement).length > 0)
        .map(requirement => Object.keys(requirement).map(name => credentialNames[name] ?? name).join(' + '));

    return <article id={id} className={cn('min-w-0 scroll-mt-20 border-b border-border pb-12 last:border-0')}>
        <div className={cn('flex flex-wrap items-center gap-3')}>
            <span className={cn('rounded-md border border-border bg-muted px-2 py-1 text-xs font-semibold', method === 'get' && 'border-emerald-600/20 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400')}>{method.toUpperCase()}</span>
            <code className={cn('break-all text-sm')}>{path}</code>
            {operation.deprecated && <span className={cn('text-xs text-amber-700 dark:text-amber-400')}>En desuso</span>}
            <a href={`#${encodeURIComponent(id)}`} aria-label={`Enlace a ${method.toUpperCase()} ${path}`} className={cn('ml-auto text-xs text-muted-foreground hover:text-foreground')}>#</a>
        </div>
        <h2 className={cn('mt-5 text-2xl font-semibold tracking-tight')}>{operation.summary ?? operation.operationId ?? path}</h2>
        {operation.description && <p className={cn('mt-3 max-w-2xl whitespace-pre-line text-sm leading-5 text-muted-foreground')}>{operation.description}</p>}
        <p className={cn('mt-3 text-sm')}>
            <span className={cn('text-muted-foreground')}>Autenticación: </span>
            <span className={cn('font-medium')}>{requiresAuthentication ? credentials.join(' o ') : 'No requerida'}</span>
        </p>
        <div className={cn('mt-8 grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_320px]')}>
            <div key={id} className={cn('min-w-0 space-y-10')}>
                <Parameters parameters={operation.parameters ?? []} document={document}/>
                {body && <section>
                    <h3 className={cn('text-sm font-medium')}>Cuerpo de la petición {body.required ? '· obligatorio' : '· opcional'}</h3>
                    {body.description && <p className={cn('mt-2 text-xs leading-6 text-muted-foreground')}>{body.description}</p>}
                    {Object.entries(body.content ?? {}).map(([mediaType, media]) => <div key={mediaType} className={cn('mt-4 rounded-lg border border-border px-4 py-2')}>
                        <p className={cn('py-2 text-xs text-muted-foreground')}>{mediaType}</p>
                        {media.schema && <SchemaFields schema={media.schema} document={document}/>}
                    </div>)}
                </section>}
                <Responses operation={operation} document={document}/>
            </div>
            <div className={cn('min-w-0 space-y-4')}>
                <CodeExample key={id} title="Ejemplo · cURL" code={requestExample(endpoint, document, baseUrl)}/>
                <ApiTokenPanel/>
            </div>
        </div>
    </article>;
}
