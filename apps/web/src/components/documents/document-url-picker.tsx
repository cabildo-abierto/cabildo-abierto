"use client";

import {useState} from 'react';
import type {DocumentImportOutput} from '@cabildo-abierto/api';
import {validDatasetUrl, type DocumentBlockContent} from '@cabildo-abierto/utils';
import {post} from '@/utils/react/fetch';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Spinner} from '@/components/ui/spinner';
import {cn} from '@/lib/utils';

export function DocumentUrlPicker({topicId, value, onChange, onBusyChange}: {
    topicId: string; value: DocumentBlockContent; onChange: (value: DocumentBlockContent) => void; onBusyChange: (busy: boolean) => void;
}) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const url = value.sourceUrl ?? '';
    const load = async () => {
        setBusy(true); onBusyChange(true); setError(null);
        try {
            const result = await post<{url: string}, DocumentImportOutput>(`/topics/${encodeURIComponent(topicId)}/documents/import`, {url});
            if ('error' in result) throw new Error(result.error);
            onChange({...value, fileId: result.value.fileId, sourceUrl: result.value.sourceUrl,
                title: value.title || result.value.fileName.replace(/\.[^.]+$/, '').slice(0, 200)});
            setError(result.value.previewError);
        } catch (error) { setError(error instanceof Error ? error.message : 'No pudimos importar el documento.'); }
        finally { setBusy(false); onBusyChange(false); }
    };
    return <div className={cn('space-y-2')}>
        <Input type="url" aria-label="URL del documento" placeholder="https://…" maxLength={4096} value={url}
            onChange={event => {setError(null); onChange({...value, sourceUrl: event.target.value, fileId: ''});}}/>
        <Button type="button" size="sm" variant="secondary" disabled={busy || !validDatasetUrl(url.trim())} onClick={() => void load()}>
            {busy && <Spinner/>}{value.fileId ? 'Volver a importar' : 'Importar'}
        </Button>
        {value.fileId && <p className={cn('text-xs text-muted-foreground')}>Documento importado.</p>}
        {error && <p role="alert" className={cn('text-xs text-destructive')}>{error}</p>}
    </div>;
}
