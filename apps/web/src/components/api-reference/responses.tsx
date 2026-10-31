"use client";

import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {cn} from '@/lib/utils';
import {SchemaFields} from './schema-fields';
import {resolveReference, type ApiDocument, type Operation} from './openapi';

export function Responses({operation, document}: {operation: Operation; document: ApiDocument}) {
    const responses = Object.entries(operation.responses ?? {}).map(([status, response]) => [status, resolveReference(response, document)] as const);
    if (!responses.length) return null;
    return <section>
        <h3 className={cn('text-sm font-medium')}>Respuestas</h3>
        <p className={cn('mt-1 text-xs leading-5 text-muted-foreground')}>Estructura de los datos según el código HTTP.</p>
        <Tabs defaultValue={responses[0][0]} className={cn('mt-5')}>
            <TabsList aria-label="Código de respuesta" className={cn('max-w-full flex-wrap')}>
                {responses.map(([status]) => <TabsTrigger key={status} value={status}>
                    <span className={cn('mr-1.5 inline-block size-1.5 rounded-full', status.startsWith('2') ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-amber-600 dark:bg-amber-400')}/>{status}
                </TabsTrigger>)}
            </TabsList>
            {responses.map(([status, response]) => <TabsContent key={status} value={status} className={cn('mt-4 rounded-lg border border-border px-4 py-2')}>
                <p className={cn('border-b border-border py-3 text-xs text-muted-foreground')}>{response.description}</p>
                {Object.entries(response.content ?? {}).map(([mediaType, media]) => <div key={mediaType} className={cn('py-2')}>
                    <p className={cn('py-2 text-[10px] text-muted-foreground')}>{mediaType}</p>
                    {media.schema && <SchemaFields schema={media.schema} document={document}/>}
                </div>)}
                {!response.content && <p className={cn('py-3 text-xs text-muted-foreground')}>Sin cuerpo de respuesta.</p>}
            </TabsContent>)}
        </Tabs>
    </section>;
}
