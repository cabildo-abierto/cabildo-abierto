import {useCallback, useEffect, useRef, useState} from 'react';
import type {ChartTooltipState} from '@/components/visualizations/visualization-tooltip';

export function useChartTooltip(resetKey: unknown, width: number, height: number) {
    const svg = useRef<SVGSVGElement>(null);
    const [state,setState] = useState<{data: ChartTooltipState; resetKey: unknown; width: number; height: number} | null>(null);
    const data = state && state.resetKey === resetKey && state.width === width && state.height === height ? state.data : null;
    const close = useCallback(() => setState(null), []);
    const show = (value: ChartTooltipState) => setState({data: value,resetKey,width,height});
    const visible = !!data;
    useEffect(() => {
        if (!visible) return;
        const dismiss = (event: PointerEvent) => {
            const target = event.target;
            if (!(target instanceof Element) || !svg.current?.contains(target) || !target.closest('[data-chart-hit]')) close();
        };
        const escape = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;
            event.preventDefault(); event.stopPropagation(); close();
        };
        window.addEventListener('scroll',close,true);
        window.addEventListener('resize',close);
        document.addEventListener('pointerdown',dismiss);
        document.addEventListener('keydown',escape,true);
        return () => {
            window.removeEventListener('scroll',close,true);
            window.removeEventListener('resize',close);
            document.removeEventListener('pointerdown',dismiss);
            document.removeEventListener('keydown',escape,true);
        };
    }, [visible,close]);
    const position = (plotX: number, plotY: number) => {
        const element = svg.current;
        if (!element) return {clientX: 0,clientY: 0};
        const rect = element.getBoundingClientRect();
        return {clientX: rect.left+plotX*rect.width/width,clientY: rect.top+plotY*rect.height/height};
    };
    return {svg,data,show,close,position};
}
