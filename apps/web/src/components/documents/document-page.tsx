"use client";

import {useState} from "react";
import {useDocument} from "@/hooks/use-document";
import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";
import {post} from "@/utils/react/fetch";
import {cn} from "@/lib/utils";
import {DocumentPageHeader} from "./document-page-header";
import {DocumentViewer} from "./document-viewer";

export function DocumentPage({versionId, inWindow = false}: {versionId: string; inWindow?: boolean}) {
    const [retrying, setRetrying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const query = useDocument(versionId);
    if (query.isLoading) return <div className={cn("flex items-center justify-center p-6 text-muted-foreground", inWindow ? "h-full" : "min-h-[75dvh]")}>
        <Spinner aria-label="Cargando documento" className={cn("size-7")}/>
    </div>;
    if (!query.data) return <p role="alert" className={cn("p-6 text-sm text-destructive")}>{query.error?.message ?? 'No encontramos el documento.'}</p>;
    const document = query.data;
    return <article className={cn("mx-auto w-full min-w-0", inWindow ? "flex min-h-full flex-col gap-3 p-3" : "space-y-5 p-6", !inWindow && (document.format === "pdf" || document.format === "office" ? "max-w-4xl" : "max-w-[682px]"))}>
        {!inWindow && <DocumentPageHeader document={document}/>}
        {document.format === 'office' && document.previewStatus !== 'ready' && document.canRetry && <Button variant="outline" size="sm" disabled={retrying} onClick={async () => {
            setRetrying(true); setError(null);
            const result = await post(`/documents/${document.id}/preview`);
            if ("error" in result) setError(result.error);
            await query.refetch(); setRetrying(false);
        }}>{retrying ? 'Preparando vista previa…' : 'Reintentar vista previa'}</Button>}
        {error && <p role="alert" className={cn("text-sm text-destructive")}>{error}</p>}
        <DocumentViewer document={document} inWindow={inWindow}/>
    </article>;
}
