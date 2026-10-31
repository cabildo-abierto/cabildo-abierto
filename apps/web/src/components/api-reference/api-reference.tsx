"use client";

import {useQuery} from '@tanstack/react-query';
import {Button} from '@/components/ui/button';
import {Spinner} from '@/components/ui/spinner';
import {backendUrl} from '@/lib/fetch';
import {cn} from '@/lib/utils';
import type {ApiDocument} from './openapi';
import {ReferenceLayout} from './reference-layout';

export function ApiReference() {
    const {data, isPending, error, refetch} = useQuery({
        queryKey: ['api-reference'],
        queryFn: async ({signal}) => {
            const response = await fetch(`${backendUrl}/openapi.json`, {signal});
            if (!response.ok) throw new Error('No se pudo cargar el contrato de la API.');
            const document = await response.json() as ApiDocument;
            if (!document.info || !document.paths || typeof document.paths !== 'object') throw new Error('El contrato de la API no es válido.');
            return document;
        },
        staleTime: 60_000,
        retry: 1,
    });

    if (isPending) return <div role="status" className={cn('flex min-h-80 items-center justify-center gap-3 text-sm text-muted-foreground')}><Spinner className={cn('size-5')}/>Cargando la referencia de la API…</div>;
    if (error || !data) return <div role="alert" className={cn('mx-auto max-w-lg space-y-4 px-5 py-20')}>
        <h1 className={cn('text-xl font-semibold')}>La documentación no está disponible</h1>
        <p className={cn('text-sm leading-6 text-muted-foreground')}>No pudimos obtener la referencia del backend. Intentá nuevamente en unos instantes.</p>
        <Button variant="outline" onClick={() => void refetch()}>Reintentar</Button>
    </div>;
    return <ReferenceLayout document={data}/>;
}
