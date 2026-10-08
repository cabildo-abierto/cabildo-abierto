"use client";

import type {ReactNode} from 'react';
import {Dialog} from '@base-ui/react/dialog';
import {ArrowsOutSimpleIcon, ChartBarIcon, CornersInIcon, XIcon} from '@phosphor-icons/react';
import {Button} from '@/components/ui/button';
import {DocumentWindowResizeHandles} from '@/components/documents/document-window-resize-handles';
import {useDocumentWindow} from '@/hooks/use-document-window';
import {useIsMobile} from '@/hooks/use-is-mobile';
import {cn} from '@/lib/utils';

export function VisualizationExpandedWindow({title, children}: {title?: string; children: ReactNode}) {
    const {style, maximized, interacting, toggleMaximized, moveControls, resizeControls} = useDocumentWindow();
    const mobile = useIsMobile() ?? window.innerWidth < 768;
    return <>
        <Dialog.Backdrop data-attachment-editor-popup className={cn('fixed inset-0 z-50 bg-black/50')}/>
        <Dialog.Popup data-attachment-editor-popup style={mobile ? {inset: 8} : style}
            className={cn('fixed z-50 flex flex-col overflow-hidden rounded-xl border bg-background text-foreground shadow-2xl outline-none')}
            onMouseDown={event => event.stopPropagation()}>
            <header className={cn('flex shrink-0 items-center gap-1 border-b bg-muted/50 px-3 py-1.5')}>
                <div role={mobile ? undefined : 'button'} tabIndex={mobile ? undefined : 0}
                    aria-label={mobile ? undefined : 'Mover ventana; usá las flechas del teclado o arrastrá'}
                    className={cn('flex min-w-0 flex-1 items-center gap-2 rounded-sm outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/30', !mobile && 'touch-none', !mobile && !maximized && 'cursor-move')}
                    {...(!mobile ? moveControls : {})} onDoubleClick={mobile ? undefined : toggleMaximized}>
                    <ChartBarIcon aria-hidden="true" className={cn('size-4 shrink-0 text-muted-foreground')}/>
                    <Dialog.Title className={cn('truncate text-sm font-medium')}>{title || 'Visualización'}</Dialog.Title>
                </div>
                {!mobile && <Button type="button" variant="ghost" size="icon-sm" onClick={toggleMaximized}
                    aria-label={maximized ? 'Restaurar tamaño' : 'Maximizar ventana'} title={maximized ? 'Restaurar tamaño' : 'Maximizar ventana'}>
                    {maximized ? <CornersInIcon/> : <ArrowsOutSimpleIcon/>}
                </Button>}
                <Dialog.Close render={<Button type="button" variant="ghost" size="icon-sm" className={cn(mobile && 'size-10')}/>} aria-label="Cerrar visualización" title="Cerrar"><XIcon/></Dialog.Close>
            </header>
            <Dialog.Description className={cn('sr-only')}>Vista ampliada del gráfico y sus datos.</Dialog.Description>
            <div className={cn('min-h-0 flex-1 overflow-auto p-3 md:p-5', interacting && 'pointer-events-none select-none')}>{children}</div>
            {!mobile && !maximized && <DocumentWindowResizeHandles controls={resizeControls}/>}
        </Dialog.Popup>
    </>;
}
