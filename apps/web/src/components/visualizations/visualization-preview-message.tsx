import {InfoIcon, WarningCircleIcon} from '@phosphor-icons/react';
import {Spinner} from '@/components/ui/spinner';
import {cn} from '@/lib/utils';

export type PreviewMessage = {tone: 'help' | 'system' | 'loading'; title: string; description: string; detail?: string};
export function VisualizationPreviewMessage({message}: {message: PreviewMessage}) {
    const system = message.tone === 'system';
    return <div role={system ? 'alert' : 'status'} className={cn('flex items-start gap-3 rounded-md border p-4 text-sm',system ? 'border-destructive/30 text-destructive' : 'border-border bg-muted/30 text-foreground')}>
        {message.tone === 'loading' ? <Spinner className={cn('mt-0.5 size-4 shrink-0')}/> : system ? <WarningCircleIcon className={cn('mt-0.5 size-4 shrink-0')}/> : <InfoIcon className={cn('mt-0.5 size-4 shrink-0 text-muted-foreground')}/>}
        <div className={cn('min-w-0 space-y-1')}>
            <p className={cn('font-medium')}>{message.title}</p>
            <p className={cn('text-xs',!system && 'text-muted-foreground')}>{message.description}</p>
            {message.detail && <details className={cn('pt-2 text-xs')}><summary className={cn('cursor-pointer')}>Ver detalle</summary><p className={cn('mt-2 whitespace-pre-wrap break-words')}>{message.detail}</p></details>}
        </div>
    </div>;
}
