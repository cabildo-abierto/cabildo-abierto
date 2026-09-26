import {cn} from '@/lib/utils';
export const plotColors = ['#3b82f6', '#e87944', '#10b981', '#a78bfa', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16', '#ef4444', '#64748b', '#14b8a6', '#d946ef'];
export function VisualizationLegend({labels}: {labels: string[]}) {
    return <div className={cn('flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs')}>{labels.map((label,i) => <span key={i} className={cn('inline-flex min-w-0 items-center gap-1')}><span className={cn('size-2 shrink-0 rounded-full')} style={{backgroundColor: plotColors[i % plotColors.length]}}/>{label}</span>)}</div>;
}
