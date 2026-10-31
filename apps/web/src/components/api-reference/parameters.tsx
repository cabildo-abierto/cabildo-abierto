import {ReferenceDisclosure} from './reference-disclosure';
import {cn} from '@/lib/utils';
import {resolveReference, schemaConstraints, schemaType, type ApiDocument, type Parameter} from './openapi';

const locations: Record<string, string> = {query: 'Consulta', path: 'Ruta', header: 'Cabecera', cookie: 'Cookie'};

export function Parameters({parameters, document}: {parameters: Parameter[]; document: ApiDocument}) {
    if (!parameters.length) return null;
    return <section>
        <h3 className={cn('text-sm font-medium')}>Parámetros</h3>
        <div className={cn('mt-5 divide-y divide-border border-y border-border')}>
            {parameters.map(parameter => {
                const schema = resolveReference(parameter.schema ?? {}, document);
                return <div key={`${parameter.in}:${parameter.name}`} className={cn('grid gap-2 py-5 sm:grid-cols-[120px_1fr] sm:gap-5')}>
                    <div>
                        <code className={cn('break-words text-sm font-medium')}>{parameter.name}</code>
                        <div className={cn('mt-1 text-[10px] text-muted-foreground')}>{locations[parameter.in] ?? parameter.in} · {parameter.required ? 'Obligatorio' : 'Opcional'}</div>
                    </div>
                    <div className={cn('min-w-0 space-y-2')}>
                        <span className={cn('rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[11px] text-muted-foreground')}>{schemaType(schema)}</span>
                        {(parameter.description ?? schema.description) && <p className={cn('text-xs leading-6 text-muted-foreground')}>{parameter.description ?? schema.description}</p>}
                        <div className={cn('flex flex-wrap gap-x-4 gap-y-1 break-all text-[11px] text-muted-foreground')}>
                            {schemaConstraints(schema).filter(constraint => !constraint.startsWith('Patrón:')).map(constraint => <span key={constraint}>{constraint}</span>)}
                        </div>
                        {schema.enum && <p className={cn('break-words text-[11px] text-muted-foreground')}>Valores: {schema.enum.map(value => JSON.stringify(value)).join(' · ')}</p>}
                        {schema.pattern && <ReferenceDisclosure title="Patrón de validación">
                            <code className={cn('block break-all rounded bg-muted p-2 text-[11px] leading-5')}>{schema.pattern}</code>
                        </ReferenceDisclosure>}
                    </div>
                </div>;
            })}
        </div>
    </section>;
}
