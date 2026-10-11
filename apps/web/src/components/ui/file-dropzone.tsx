"use client";

import {useRef, useState} from 'react';
import {UploadSimpleIcon} from '@phosphor-icons/react';
import {Button} from '@/components/ui/button';
import {Spinner} from '@/components/ui/spinner';
import {cn} from '@/lib/utils';

function acceptsFile(file: File, accept: string) {
    return accept.split(',').some(value => {
        const type = value.trim().toLowerCase();
        if (type.startsWith('.')) return file.name.toLowerCase().endsWith(type);
        if (type.endsWith('/*')) return file.type.toLowerCase().startsWith(type.slice(0, -1));
        return file.type.toLowerCase() === type;
    });
}

export function FileDropzone({accept, label, hint, busy = false, disabled = false, onSelect}: {
    accept: string;
    label: string;
    hint?: string;
    busy?: boolean;
    disabled?: boolean;
    onSelect: (file: File) => Promise<void>;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const pendingRef = useRef(false);
    const dragDepth = useRef(0);
    const [dragging, setDragging] = useState(false);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const unavailable = disabled || busy || pending;

    const select = async (files: File[]) => {
        if (unavailable || pendingRef.current || files.length === 0) return;
        setError(null);
        if (files.length !== 1) {
            setError('Elegí un solo archivo por vez.');
            return;
        }
        const file = files[0];
        if (!acceptsFile(file, accept)) {
            setError('El formato del archivo no está admitido.');
            return;
        }
        pendingRef.current = true;
        setPending(true);
        try { await onSelect(file); }
        catch (cause) { setError(cause instanceof Error ? cause.message : 'No pudimos cargar el archivo.'); }
        finally { pendingRef.current = false; setPending(false); }
    };

    return <div className={cn('min-w-0 space-y-2')}
        onDragEnter={event => {
            event.preventDefault();
            if (unavailable || !event.dataTransfer.types.includes('Files')) return;
            dragDepth.current += 1;
            setDragging(true);
        }}
        onDragOver={event => {
            event.preventDefault();
            event.dataTransfer.dropEffect = unavailable ? 'none' : 'copy';
        }}
        onDragLeave={event => {
            event.preventDefault();
            dragDepth.current = Math.max(0, dragDepth.current - 1);
            if (dragDepth.current === 0) setDragging(false);
        }}
        onDrop={event => {
            event.preventDefault();
            event.stopPropagation();
            dragDepth.current = 0;
            setDragging(false);
            void select(Array.from(event.dataTransfer.files));
        }}>
        <input ref={inputRef} type="file" accept={accept} hidden disabled={unavailable}
            onChange={event => {
                const files = Array.from(event.target.files ?? []);
                event.target.value = '';
                void select(files);
            }}/>
        <Button type="button" variant="outline" disabled={unavailable} onClick={() => inputRef.current?.click()}
            className={cn('h-auto min-h-28 w-full flex-col gap-2 whitespace-normal border-dashed p-4 text-center', dragging && !unavailable && 'border-primary bg-primary/5')}>
            {busy || pending ? <Spinner/> : <UploadSimpleIcon className={cn('size-5')}/>}
            <span>{busy || pending ? 'Cargando archivo…' : dragging ? 'Soltá el archivo acá' : label}</span>
            {hint && <span className={cn('text-xs font-normal text-muted-foreground')}>{hint}</span>}
        </Button>
        {error && <p role="alert" className={cn('text-xs text-destructive')}>{error}</p>}
    </div>;
}
