import {useEffect, useRef, useState, type CSSProperties, type ReactNode} from 'react';
import {cn} from '@/lib/utils';

export function VisualizationEditorPanels({children}: {children: [ReactNode, ReactNode]}) {
    const container = useRef<HTMLDivElement>(null);
    const [width,setWidth] = useState(352);
    const [containerWidth,setContainerWidth] = useState(0);
    const min = 240;
    const max = containerWidth ? Math.max(min,containerWidth-246) : 352;
    const current = Math.min(width,max);
    const resize = (value: number) => setWidth(Math.min(max,Math.max(min,value)));
    useEffect(() => {
        const element = container.current;
        if (!element) return;
        const observer = new ResizeObserver(entries => setContainerWidth(entries[0]?.contentRect.width ?? 0));
        observer.observe(element);
        return () => observer.disconnect();
    }, []);
    return <div ref={container} style={{'--editor-sidebar-width': `${current}px`} as CSSProperties}
        className={cn('grid min-h-0 min-w-0 flex-1 grid-cols-1 overflow-y-auto md:grid-cols-[minmax(0,var(--editor-sidebar-width))_6px_minmax(0,1fr)] md:overflow-hidden')}>
        {children[0]}
        <div role="separator" aria-label="Ancho del panel de edición" aria-orientation="vertical" aria-valuemin={min} aria-valuemax={Math.round(max)} aria-valuenow={Math.round(current)} tabIndex={0}
            title="Arrastrar para ajustar el ancho"
            className={cn('group relative hidden touch-none cursor-col-resize select-none outline-none hover:bg-primary/10 focus-visible:bg-primary/10 md:block')}
            onPointerDown={event => {
                if (event.button !== 0) return;
                event.preventDefault();
                event.currentTarget.focus();
                event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={event => {
                if (!event.currentTarget.hasPointerCapture(event.pointerId) || !container.current) return;
                resize(event.clientX-container.current.getBoundingClientRect().left);
            }}
            onPointerUp={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
            onKeyDown={event => {
                if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
                event.preventDefault();
                resize(event.key === 'Home' ? min : event.key === 'End' ? max : current+(event.key === 'ArrowLeft' ? -20 : 20));
            }}>
            <span className={cn('absolute inset-y-0 left-1/2 w-px bg-border group-hover:bg-primary/50 group-focus-visible:bg-primary/50')}/>
        </div>
        {children[1]}
    </div>;
}
