"use client";

import {Dialog} from '@base-ui/react/dialog';
import {XIcon} from '@phosphor-icons/react';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';

export type DatasetCellError = {column: string; row: number; message: string; raw: string; trigger: HTMLButtonElement};

export function DatasetCellErrorDialog({error, onClose, fallbackFocus}: {
    error: DatasetCellError; onClose: () => void; fallbackFocus: HTMLDivElement | null;
}) {
    return <Dialog.Root open onOpenChange={open => { if (!open) onClose(); }}>
        <Dialog.Portal>
            <Dialog.Backdrop data-attachment-editor-popup className={cn('fixed inset-0 z-[100] bg-black/40')}/>
            <Dialog.Popup data-attachment-editor-popup finalFocus={() => error.trigger.isConnected ? error.trigger : fallbackFocus}
                className={cn('fixed top-1/2 left-1/2 z-[100] max-h-[90dvh] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border bg-popover p-4 text-popover-foreground shadow-xl outline-none')}>
                <header className={cn('mb-3 flex items-center gap-2')}>
                    <Dialog.Title className={cn('min-w-0 flex-1 break-words text-sm font-medium')}>Error en {error.column} · Fila {error.row}</Dialog.Title>
                    <Dialog.Close render={<Button type="button" variant="ghost" size="icon-sm"/>} aria-label="Cerrar"><XIcon/></Dialog.Close>
                </header>
                <Dialog.Description className={cn('whitespace-pre-wrap wrap-anywhere text-sm text-destructive')}>{error.message}</Dialog.Description>
                <p className={cn('mt-4 text-xs font-medium')}>Valor original</p>
                <p className={cn('mt-1 whitespace-pre-wrap wrap-anywhere text-sm text-muted-foreground')}>{error.raw || '(ausente)'}</p>
            </Dialog.Popup>
        </Dialog.Portal>
    </Dialog.Root>;
}
