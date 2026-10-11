"use client";

import {useEffect, useRef, useState} from 'react';
import {cn} from '@/lib/utils';
import {DocumentZoomControls} from './document-zoom-controls';

export function DocumentHtmlViewer({url, title, inWindow}: {url: string; title: string; inWindow: boolean}) {
    const [zoom, setZoom] = useState(100);
    const containerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState<{width: number; height: number} | null>(null);
    const scale = zoom / 100;

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const observer = new ResizeObserver(([entry]) => {
            setSize({width: entry.contentRect.width, height: entry.contentRect.height});
        });
        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    return <div ref={containerRef} className={cn('relative w-full overflow-hidden rounded-md border bg-background', inWindow ? 'min-h-96 flex-1' : 'h-[75dvh] min-h-96')}>
        <iframe src={url} title={title} sandbox="" referrerPolicy="no-referrer" className={cn('absolute top-0 left-0 border-0')}
            style={{width: size ? size.width / scale : '100%', height: size ? size.height / scale : '100%', zoom: scale}}/>
        <DocumentZoomControls zoom={zoom} onChange={setZoom}/>
    </div>;
}
