"use client";

import {useState} from 'react';
import {CheckIcon, CopyIcon} from '@phosphor-icons/react';
import {Button} from '@/components/ui/button';
import {ScrollArea} from '@/components/ui/scroll-area';
import {cn} from '@/lib/utils';

export function CodeExample({title, code}: {title: string; code: string}) {
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState(false);

    async function copy() {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setError(false);
        } catch {
            setError(true);
        }
    }

    return <div className={cn('overflow-hidden rounded-lg border border-border bg-muted/35')}>
        <div className={cn('flex items-center justify-between border-b border-border px-4 py-2')}>
            <span className={cn('text-xs text-muted-foreground')}>{title}</span>
            <Button variant="ghost" size="icon" aria-label={copied ? 'Copiado' : 'Copiar ejemplo'} onClick={() => void copy()}>
                {copied ? <CheckIcon/> : <CopyIcon/>}
            </Button>
        </div>
        <ScrollArea horizontal>
            <pre className={cn('w-max min-w-full p-4 text-xs leading-6')}><code>{code}</code></pre>
        </ScrollArea>
        <span role="status" className={cn(error ? 'block px-4 pb-3 text-xs text-destructive' : 'sr-only')}>
            {error ? 'No se pudo copiar. Podés seleccionar el texto del ejemplo.' : copied ? 'Ejemplo copiado.' : ''}
        </span>
    </div>;
}
