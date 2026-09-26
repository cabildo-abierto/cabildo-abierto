import {useEffect, useState, type ReactNode} from 'react';
import {cn} from '@/lib/utils';

export function VisualizationUpdatingFrame({updating, children}: {updating: boolean; children: ReactNode}) {
    const [settling, setSettling] = useState(updating);
    const dimmed = updating || settling;
    useEffect(() => {
        if (updating) {
            setSettling(true);
            return;
        }
        if (!settling) return;
        // Let the new chart paint before restoring its opacity.
        let paintFrame: number | undefined;
        const frame = requestAnimationFrame(() => {
            paintFrame = requestAnimationFrame(() => setSettling(false));
        });
        return () => {
            cancelAnimationFrame(frame);
            if (paintFrame !== undefined) cancelAnimationFrame(paintFrame);
        };
    }, [updating, settling]);
    return <div aria-busy={updating} className={cn('transition-opacity ease-in-out motion-reduce:transition-none',
        dimmed ? 'pointer-events-none opacity-50 duration-150' : 'opacity-100 duration-350')}>
        {children}
    </div>;
}
