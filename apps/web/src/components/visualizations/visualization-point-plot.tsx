import {memo, useMemo, type PointerEvent} from 'react';
import {AxisBottom, AxisLeft} from '@visx/axis';
import {GridRows} from '@visx/grid';
import {scaleLinear} from '@visx/scale';
import {LinePath} from '@visx/shape';
import type {LineChart, ScatterChart} from '@cabildo-abierto/api';
import {formatTableValue, type PlotSeries} from '@cabildo-abierto/utils';
import {plotColors} from './visualization-legend';
import {VisualizationTooltip} from './visualization-tooltip';
import {useChartTooltip} from '@/hooks/use-chart-tooltip';
export const VisualizationPointPlot = memo(function VisualizationPointPlot({chart, series, temporal, width, height, preview = false}: {chart: LineChart | ScatterChart; series: PlotSeries[]; temporal: boolean; width: number; height: number; preview?: boolean}) {
    const tooltip = useChartTooltip(series,width,height);
    const margin = preview ? {left: 6, right: 6, top: 6, bottom: 6} : {left: 70, right: 20, top: 15, bottom: 65};
    const w = Math.max(1,width-margin.left-margin.right), h = Math.max(1,height-margin.top-margin.bottom);
    let xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity, maxSize = 1;
    for (const s of series) for (const point of s.points) {
        xmin = Math.min(xmin,point.x); xmax = Math.max(xmax,point.x);
        if (point.y !== null) { ymin = Math.min(ymin,point.y); ymax = Math.max(ymax,point.y); }
        if (point.size !== undefined) maxSize = Math.max(maxSize,point.size);
    }
    const domain = (min: number, max: number): [number,number] => !Number.isFinite(min) ? [0,1] : min === max ? [min-0.5,max+0.5] : [min,max];
    const x = scaleLinear({domain: domain(xmin,xmax), range: [0,w], nice: !temporal});
    const y = scaleLinear({domain: domain(ymin,ymax), range: [h,0], nice: true});
    const yAxis = chart.type === 'line' ? chart.yAxis : chart.y;
    const xFormat = (value: number) => formatTableValue(temporal ? new Date(value).toISOString() : value, chart.x.format ?? (temporal ? {type: 'date'} : undefined));
    const yFormat = (value: number) => formatTableValue(value,yAxis?.format);
    const linePoints = useMemo(() => {
        const byX = new Map<number,{point: PlotSeries['points'][number]; label: string; color: string}[]>();
        if (!preview && chart.type === 'line') series.forEach((s,i) => s.points.forEach(point => {
            if (point.y === null) return;
            const values = byX.get(point.x) ?? [];
            values.push({point,label: s.label,color: plotColors[i % plotColors.length]});
            byX.set(point.x,values);
        }));
        return {byX,xs: [...byX.keys()].sort((a,b) => a-b)};
    }, [series,chart.type,preview]);
    const showLine = (selectedX: number) => {
        const values = linePoints.byX.get(selectedX);
        if (!values?.length) return;
        tooltip.show({selectedX,...tooltip.position(margin.left+x(selectedX),margin.top+h/2),title: `${chart.x.label ?? chart.x.field}: ${xFormat(selectedX)}`,
            rows: values.map(value => ({label: value.label,value: yFormat(value.point.y!),color: value.color}))});
    };
    const pointAtPointer = (event: PointerEvent<SVGRectElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const pixel = (event.clientX-rect.left)*w/Math.max(1,rect.width);
        const xs = linePoints.xs;
        if (!xs.length) return;
        let low = 0, high = xs.length-1;
        while (low < high) { const middle = Math.floor((low+high)/2); if (x(xs[middle]) < pixel) low = middle+1; else high = middle; }
        const index = low > 0 && Math.abs(x(xs[low-1])-pixel) <= Math.abs(x(xs[low])-pixel) ? low-1 : low;
        showLine(xs[index]);
    };
    const tickStyle = {fill: 'var(--foreground)', fontSize: 10};
    return <><svg ref={tooltip.svg} width={width} height={height} role={preview ? "img" : "group"} onPointerLeave={preview ? undefined : event => { if (event.pointerType !== 'touch') tooltip.close(); }} aria-label={chart.type === 'line' ? 'Gráfico de líneas' : 'Gráfico de dispersión'}>
        <g transform={`translate(${margin.left},${margin.top})`}>
            {!preview && chart.showGrid !== false && <GridRows scale={y} width={w} stroke="var(--border)"/>}
            {series.map((s,i) => <g key={i}>
                {chart.type === 'line' && <LinePath data={s.points} x={point => x(point.x)} y={point => y(point.y ?? 0)} defined={point => point.y !== null} stroke={plotColors[i % plotColors.length]} strokeWidth={2}/>}
                {(chart.type === 'scatter' || (!preview && chart.showPoints)) && s.points.map((point,j) => {
                    if (point.y === null) return null;
                    const radius = point.size === undefined ? (preview ? 2 : 3.5) : Math.sqrt(preview ? 4+25*point.size/maxSize : 9+100*point.size/maxSize);
                    const color = plotColors[i % plotColors.length];
                    const details = {title: s.label || 'Punto',rows: [
                        {label: chart.x.label ?? chart.x.field,value: xFormat(point.x)},
                        {label: chart.type === 'scatter' ? chart.y.label ?? chart.y.field : s.label,value: yFormat(point.y),color},
                        ...(chart.type === 'scatter' && chart.color ? [{label: chart.color.label ?? chart.color.field,value: s.label}] : []),
                        ...(chart.type === 'scatter' && chart.size && point.size !== undefined ? [{label: chart.size.label ?? chart.size.field,value: formatTableValue(point.size)}] : []),
                    ]};
                    return <g key={j}>
                        <circle cx={x(point.x)} cy={y(point.y)} r={radius} fill={color} fillOpacity={0.8} pointerEvents="none"/>
                        {!preview && chart.type === 'scatter' && <circle cx={x(point.x)} cy={y(point.y)} r={Math.max(8,radius)} fill="transparent" tabIndex={0} role="img"
                            aria-label={details.rows.map(row => `${row.label}: ${row.value}`).join(' · ')}
                            onPointerMove={event => tooltip.show({...details,clientX: event.clientX,clientY: event.clientY})}
                            onPointerDown={event => tooltip.show({...details,clientX: event.clientX,clientY: event.clientY})}
                            onFocus={() => tooltip.show({...details,...tooltip.position(margin.left+x(point.x),margin.top+y(point.y!))})} onBlur={tooltip.close}/>}
                    </g>;
                })}
            </g>)}
            {!preview && chart.type === 'line' && <>
                {tooltip.data?.selectedX !== undefined && <g pointerEvents="none">
                    <line x1={x(tooltip.data.selectedX)} x2={x(tooltip.data.selectedX)} y1={0} y2={h} stroke="var(--muted-foreground)" strokeDasharray="3 3"/>
                    {linePoints.byX.get(tooltip.data.selectedX)?.map((value,i) => <circle key={i} cx={x(value.point.x)} cy={y(value.point.y!)} r={4.5} fill={value.color} stroke="var(--background)" strokeWidth={2}/>)}
                </g>}
                <rect width={w} height={h} fill="transparent" tabIndex={0} role="group" aria-label="Consultar valores de las líneas; usá las flechas izquierda y derecha"
                    onPointerMove={pointAtPointer} onPointerDown={pointAtPointer} onFocus={event => { if (event.currentTarget.matches(':focus-visible') && linePoints.xs.length) showLine(linePoints.xs[0]); }} onBlur={tooltip.close}
                    onKeyDown={event => {
                        if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key) || !linePoints.xs.length) return;
                        event.preventDefault(); event.stopPropagation();
                        const xs = linePoints.xs, index = xs.indexOf(tooltip.data?.selectedX ?? xs[0]);
                        showLine(xs[event.key === 'Home' ? 0 : event.key === 'End' ? xs.length-1 : Math.max(0,Math.min(xs.length-1,index+(event.key === 'ArrowLeft' ? -1 : 1)))]);
                    }}/>
            </>}
            {!preview && <AxisBottom top={h} scale={x} tickFormat={v => xFormat(Number(v))} numTicks={chart.x.tickCount ?? Math.max(2,Math.floor(w/90))} label={chart.x.label ?? chart.x.field} labelProps={{fill: "var(--foreground)", fontSize: 11}} stroke="var(--border)" tickStroke="var(--border)" tickLabelProps={{...tickStyle, angle: chart.x.tickLabelAngle ?? 0}}/>}
            {!preview && <AxisLeft scale={y} tickFormat={v => yFormat(Number(v))} numTicks={yAxis?.tickCount ?? 5} label={yAxis?.label ?? (chart.type === 'scatter' ? chart.y.field : undefined)} labelProps={{fill: "var(--foreground)", fontSize: 11}} stroke="var(--border)" tickStroke="var(--border)" tickLabelProps={{...tickStyle, angle: yAxis?.tickLabelAngle ?? 0}}/>}
        </g>
    </svg>{!preview && <VisualizationTooltip data={tooltip.data}/>}</>;
});
