"use client";

import {ArrowUpRightIcon, BracketsCurlyIcon} from '@phosphor-icons/react';
import {Button} from '@/components/ui/button';
import {backendUrl} from '@/lib/fetch';
import {cn} from '@/lib/utils';
import {getEndpoints, type ApiDocument} from './openapi';
import {ReferenceNavigation} from './reference-navigation';
import {OperationReference} from './operation-reference';
import {useEndpointSelection} from './use-endpoint-selection';

export function ReferenceLayout({document}: {document: ApiDocument}) {
    const endpoints = getEndpoints(document);
    const {selectedId, selectEndpoint} = useEndpointSelection();
    const selectedEndpoint = endpoints.find(endpoint => endpoint.id === selectedId) ?? endpoints[0];
    const server = document.servers?.[0]?.url;
    const baseUrl = server ? new URL(server, `${backendUrl.replace(/\/$/, '')}/`).toString().replace(/\/$/, '') : backendUrl;

    return <div className={cn('w-full min-w-0 px-5 pb-20 sm:px-8')}>
        <header className={cn('mt-8 flex flex-wrap items-end justify-between gap-5 border-b border-border pb-8')}>
            <div className={cn('max-w-2xl')}>
                <h1 className={cn('text-3xl font-semibold tracking-tight sm:text-4xl')}>Referencia de la API</h1>
                <span className={cn('rounded-full border border-border px-2 py-0.5 text-xs')}>v{document.info.version}</span>
                <p className={cn('mt-4 max-w-xl text-sm leading-7 text-muted-foreground')}>{document.info.description}</p>
            </div>
            <Button variant="outline" size="sm" nativeButton={false} render={<a href={`${backendUrl}/openapi.json`} target="_blank" rel="noreferrer"/>}>Ver OpenAPI<ArrowUpRightIcon/></Button>
        </header>
        <div className={cn('grid gap-10 pt-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12')}>
            <aside>
                <ReferenceNavigation endpoints={endpoints} selectedId={selectedEndpoint?.id} baseUrl={baseUrl} onSelect={selectEndpoint}/>
            </aside>
            <div className={cn('min-w-0 space-y-12')}>
                {selectedEndpoint && <OperationReference endpoint={selectedEndpoint} document={document} baseUrl={baseUrl}/>}
                {!endpoints.length && <p className={cn('py-10 text-sm text-muted-foreground')}>Todavía no hay endpoints documentados.</p>}
            </div>
        </div>
    </div>;
}
