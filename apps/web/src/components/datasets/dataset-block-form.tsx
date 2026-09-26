"use client";

import {useEffect, useMemo, useRef, useState} from 'react';
import type {DatasetContent, DatasetPreview} from '@cabildo-abierto/api';
import {datasetCell, validDatasetUrl} from '@cabildo-abierto/utils';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {Spinner} from '@/components/ui/spinner';
import {DocumentFilePicker} from '@/components/documents/document-file-picker';
import {backendUrl} from '@/lib/fetch';
import {cn} from '@/lib/utils';
import {DatasetTable} from './dataset-table';

function draft(content: string): DatasetContent {
    const empty: DatasetContent = {title: '', description: '', fileId: null, sourceUrl: null, columns: [], csvOptions: {delimiter: ',', decimal: '.'}};
    try { return {...empty, ...JSON.parse(content)}; } catch { return empty; }
}
export function DatasetBlockForm({topicId, content, disabled, onChange, onBusyChange, embedded = false}: {
    topicId: string; content: string; disabled: boolean; embedded?: boolean; onChange: (content: string) => void; onBusyChange: (busy: boolean) => void;
}) {
    const value = draft(content);
    const [source, setSource] = useState<'file' | 'url'>(value.sourceUrl ? 'url' : 'file');
    const [url, setUrl] = useState(value.sourceUrl ?? '');
    const [preview, setPreview] = useState<DatasetPreview | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const loaded = useRef(false);
    const latest = useRef({value, onChange, onBusyChange}); latest.current = {value, onChange, onBusyChange};
    const update = (next: Partial<DatasetContent>) => onChange(JSON.stringify({...value, ...next}));
    const load = async (file?: File) => {
        setBusy(true); latest.current.onBusyChange(true); setError(null);
        try {
            if (file && !file.name.toLowerCase().endsWith('.csv')) throw new Error('Elegí un archivo CSV.');
            const endpoint = file ? 'upload' : 'preview';
            const params = new URLSearchParams();
            if (file) params.set('name', file.name);
            const response = await fetch(`${backendUrl}/topics/${encodeURIComponent(topicId)}/datasets/${endpoint}${file ? `?${params}` : ''}`, {
                method: 'POST', credentials: 'include', headers: {'Content-Type': file ? 'application/octet-stream' : 'application/json'},
                body: file ?? JSON.stringify({fileId: source === 'file' ? latest.current.value.fileId : null,
                    sourceUrl: source === 'url' ? url : null}),
            });
            const result: {success: boolean; value: DatasetPreview; error?: string} = await response.json();
            if (!response.ok || !result.success) throw new Error(result.error || 'No pudimos cargar el CSV.');
            setPreview(result.value);
            const current = latest.current.value;
            const sameSource = result.value.fileId ? result.value.fileId === current.fileId : result.value.sourceUrl === current.sourceUrl;
            const columns = result.value.columns.map(column => ({...column,
                type: sameSource ? current.columns.find(c => c.name === column.name)?.type ?? column.type : column.type}));
            latest.current.onChange(JSON.stringify({...current, fileId: result.value.fileId, sourceUrl: result.value.sourceUrl,
                columns, csvOptions: result.value.csvOptions, rowCount: result.value.rows.length,
                title: current.title || (file?.name.replace(/\.csv$/i, '') ?? 'Conjunto de datos')}));
        } catch(e) { setError(e instanceof Error ? e.message : 'No pudimos cargar el CSV.'); }
        finally { setBusy(false); latest.current.onBusyChange(false); }
    };
    useEffect(() => {
        if (loaded.current) return;
        loaded.current = true;
        if (value.fileId || value.sourceUrl) void load();
        // Load the saved source once when entering the form, not on each draft change.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const rows = useMemo(() => {
        if (!preview) return [];
        const indices = new Map(preview.columns.map((column, index) => [column.name, index]));
        return preview.rows.map(row => value.columns.map(column => datasetCell(row[indices.get(column.name) ?? -1] ?? '', column.type, value.csvOptions)));
    }, [preview, content]);
    const fieldClass = 'h-auto min-h-0 rounded-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 dark:bg-transparent';
    return <fieldset disabled={disabled || busy} className={cn('min-w-0 space-y-3', !embedded && 'rounded-lg border p-4')}>
        <Input aria-label="Título del conjunto" placeholder="Título" value={value.title} maxLength={200} className={cn(fieldClass, 'font-medium')}
            onChange={event => update({title: event.target.value})}/>
        <Textarea aria-label="Descripción del conjunto" placeholder="Descripción" rows={1} value={value.description} maxLength={5000} className={cn(fieldClass, 'text-xs text-muted-foreground')}
            onChange={event => update({description: event.target.value})}/>
        <div className={cn('flex gap-2')}>
            {(['file','url'] as const).map(mode => <Button key={mode} type="button" size="sm" variant={source === mode ? 'secondary' : 'ghost'} aria-pressed={source === mode}
                onClick={() => { if (mode === source) return; setSource(mode); setPreview(null); update({fileId: null, sourceUrl: null, columns: [], rowCount: undefined}); }}>{mode === 'file' ? 'Archivo CSV' : 'URL'}</Button>)}
        </div>
        {source === 'file' ? <DocumentFilePicker fileId={value.fileId ?? ''} accept=".csv" busy={busy} disabled={disabled} onSelect={file => load(file)}/>
            : <div className={cn('flex items-center gap-2')}>
                <Input type="url" aria-label="URL del CSV" placeholder="https://…/datos.csv" value={url} onChange={event => { setUrl(event.target.value); setPreview(null); update({sourceUrl: null, columns: [], rowCount: undefined}); }}/>
                <Button type="button" size="sm" variant="secondary" disabled={!validDatasetUrl(url)} onClick={() => void load()}>Cargar</Button>
                {busy && <Spinner aria-label="Cargando CSV"/>}
            </div>}
        {error && <p role="alert" className={cn('text-xs text-destructive')}>{error}</p>}
        {preview && <div className={cn('space-y-2')}>
            <DatasetTable columns={value.columns} rows={rows} onTypeChange={(index, type) => update({columns: value.columns.map((column,i) => i === index ? {...column,type} : column)})}/>
        </div>}

    </fieldset>;
}
