"use client";

import {useState} from 'react';
import {Dialog} from '@base-ui/react/dialog';
import {CheckIcon, CopyIcon} from '@phosphor-icons/react';
import type {CreatedApiToken} from '@cabildo-abierto/api';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {cn} from '@/lib/utils';

export function ApiTokenSecret({value, onDismiss}: {value: CreatedApiToken; onDismiss: () => void}) {
    const [copied, setCopied] = useState(false);
    const [copyError, setCopyError] = useState(false);
    async function copy() {
        try {
            await navigator.clipboard.writeText(value.token);
            setCopied(true);
            setCopyError(false);
        } catch { setCopied(false); setCopyError(true); }
    }
    return <Dialog.Root open disablePointerDismissal onOpenChange={open => { if (!open) onDismiss(); }}>
        <Dialog.Portal>
            <Dialog.Backdrop className={cn('fixed inset-0 z-50 bg-black/40')}/>
            <Dialog.Popup className={cn('fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 space-y-4 rounded-xl border border-border bg-popover p-6 shadow-xl outline-none')}>
                <Dialog.Title className={cn('text-lg font-medium')}>Guardá tu token</Dialog.Title>
                <Dialog.Description className={cn('text-sm text-muted-foreground')}>Copialo y guardalo: después no lo vas a poder ver.</Dialog.Description>
                <Input readOnly value={value.token} aria-label="Token de API generado" autoComplete="off" spellCheck={false} onFocus={event => event.target.select()} className={cn('w-full font-mono text-sm')}/>
                <p className={cn('text-xs text-muted-foreground')}>Vence el {new Date(value.expiresAt).toLocaleDateString('es-AR')}.</p>
                <p role="status" className={cn(copyError ? 'text-xs text-destructive' : 'sr-only')}>
                    {copyError ? 'No pudimos copiarlo. Podés seleccionar y copiar el token manualmente.' : copied ? 'Token copiado.' : ''}
                </p>
                <div className={cn('flex flex-wrap justify-end gap-2')}>
                    <Button type="button" variant="outline" size="sm" onClick={() => void copy()}>{copied ? <CheckIcon/> : <CopyIcon/>}{copied ? 'Copiado' : 'Copiar'}</Button>
                    <Dialog.Close render={<Button size="sm"/>}>Ya lo guardé</Dialog.Close>
                </div>
            </Dialog.Popup>
        </Dialog.Portal>
    </Dialog.Root>;
}
