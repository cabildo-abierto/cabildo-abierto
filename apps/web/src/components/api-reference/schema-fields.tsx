import {ReferenceDisclosure} from './reference-disclosure';
import {cn} from '@/lib/utils';
import {resolveReference, schemaConstraints, schemaType, type ApiDocument, type Schema} from './openapi';

export function SchemaFields({schema, document, depth = 0}: {schema: Schema; document: ApiDocument; depth?: number}) {
    const resolved = resolveReference(schema, document);
    if (depth >= 8) return <p className={cn('py-2 text-xs text-muted-foreground')}>Esquema anidado. Consultá OpenAPI para ver la definición completa.</p>;
    const variants = resolved.oneOf ?? resolved.anyOf ?? resolved.allOf;
    if (variants) return <div className={cn('space-y-3 py-3')}>
        <p className={cn('text-xs text-muted-foreground')}>{resolved.allOf ? 'Combina todos los esquemas:' : 'Variantes posibles:'}</p>
        {variants.map((variant, index) => <ReferenceDisclosure key={index} title={`Esquema ${index + 1}`} bordered>
            <SchemaFields schema={variant} document={document} depth={depth + 1}/>
        </ReferenceDisclosure>)}
    </div>;
    const fields = resolved.items ? resolveReference(resolved.items, document) : resolved;
    if (!fields.properties) return <div className={cn('space-y-2 py-3')}>
        <code className={cn('text-xs text-muted-foreground')}>{schemaType(resolved)}</code>
        {resolved.description && <p className={cn('text-xs text-muted-foreground')}>{resolved.description}</p>}
        <pre className={cn('overflow-x-auto text-[11px] text-muted-foreground')}>{JSON.stringify(resolved, null, 2)}</pre>
    </div>;

    return <div className={cn('divide-y divide-border')}>
        {Object.entries(fields.properties).map(([name, property]) => {
            const child = resolveReference(property, document);
            const nested = child.properties || child.items || child.oneOf || child.anyOf || child.allOf || child.$ref;
            return <div key={name} className={cn('py-3')}>
                <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1')}>
                    <code className={cn('break-all text-xs font-medium')}>{name}</code>
                    <span className={cn('text-xs text-muted-foreground')}>{schemaType(child)}</span>
                    {fields.required?.includes(name) && <span className={cn('text-[10px] text-muted-foreground')}>obligatorio</span>}
                </div>
                {child.description && <p className={cn('mt-1 text-xs leading-5 text-muted-foreground')}>{child.description}</p>}
                {child.enum && <p className={cn('mt-2 break-words text-xs text-muted-foreground')}>{child.enum.map(value => JSON.stringify(value)).join(' · ')}</p>}
                {schemaConstraints(child).map(constraint => <p key={constraint} className={cn('mt-1 break-all text-[11px] text-muted-foreground')}>{constraint}</p>)}
                {nested && <ReferenceDisclosure title="Ver campos" className={cn('mt-2')} defaultOpen={depth === 0}>
                    <div className={cn('border-l border-border pl-4')}><SchemaFields schema={child} document={document} depth={depth + 1}/></div>
                </ReferenceDisclosure>}
            </div>;
        })}
    </div>;
}
