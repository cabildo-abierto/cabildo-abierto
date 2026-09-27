import {memo} from 'react';
import {AxisBottom, AxisLeft} from '@visx/axis';
import {GridColumns, GridRows} from '@visx/grid';
import {scaleBand, scaleLinear} from '@visx/scale';
import {Bar} from '@visx/shape';
import type {BarChart} from '@cabildo-abierto/api';
import {formatTableValue, type BarRow} from '@cabildo-abierto/utils';
import {plotColors} from './visualization-legend';
import {VisualizationTooltip} from './visualization-tooltip';
import {useChartTooltip} from '@/hooks/use-chart-tooltip';
export const VisualizationBarPlot = memo(function VisualizationBarPlot({chart, rows, labels, width, height, preview = false}: {chart: BarChart; rows: BarRow[]; labels: string[]; width: number; height: number; preview?: boolean}) {
    const tooltip = useChartTooltip(rows,width,height);
    const horizontal = chart.orientation === 'horizontal';
    const stacked = chart.layout === 'stacked';
    const margin = preview ? {left: 6, bottom: 6, right: 6, top: 6} : {left: horizontal ? 110 : 70, bottom: 70, right: 20, top: 15};
    const w = Math.max(1,width-margin.left-margin.right), h = Math.max(1,height-margin.top-margin.bottom);
    const category = scaleBand({domain: rows.map(row => row.key), range: [0,horizontal ? h : w], padding: 0.2});
    const sub = scaleBand({domain: labels.map((_,i) => String(i)), range: [0,category.bandwidth()], padding: 0.08});
    let min = 0, max = 0;
    for (const row of rows) for (const value of stacked ? [row.values.reduce<number>((sum,v) => sum + (v ?? 0),0)] : row.values) { if (value !== null) { min = Math.min(min,value); max = Math.max(max,value); } }
    const valueScale = scaleLinear({domain: [min,max === min ? min + 1 : max], range: horizontal ? [0,w] : [h,0], nice: true});
    const formatter = (value: number) => formatTableValue(value, chart.yAxis?.format);
    const categoryLabel = (key: string) => { const label = rows.find(row => row.key === key)?.label ?? ''; return label.length > 22 ? label.slice(0,21) + '…' : label; };
    const tickStyle = {fill: 'var(--foreground)', fontSize: 10};
    return <><svg ref={tooltip.svg} width={width} height={height} role={preview ? "img" : "group"} onPointerLeave={preview ? undefined : event => { if (event.pointerType !== 'touch') tooltip.close(); }} aria-label="Gráfico de barras">
        <g transform={`translate(${margin.left},${margin.top})`}>
            {!preview && chart.showGrid !== false && (horizontal ? <GridColumns scale={valueScale} height={h} stroke="var(--border)"/> : <GridRows scale={valueScale} width={w} stroke="var(--border)"/>)}
            {rows.flatMap(row => {
                let cumulative = 0;
                return row.values.map((value,i) => {
                    if (value === null) return null;
                    const start = stacked ? cumulative : 0; cumulative += value;
                    const end = stacked ? cumulative : value;
                    const categoryPosition = (category(row.key) ?? 0) + (stacked ? 0 : sub(String(i)) ?? 0);
                    const thickness = stacked ? category.bandwidth() : sub.bandwidth();
                    const a = valueScale(start), b = valueScale(end);
                    const bx = horizontal ? Math.min(a,b) : categoryPosition, by = horizontal ? categoryPosition : Math.min(a,b);
                    const bw = horizontal ? Math.abs(a-b) : thickness, bh = horizontal ? thickness : Math.abs(a-b);
                    const color = plotColors[i % plotColors.length];
                    const title = `${chart.x.label ?? chart.x.field}: ${row.label}`;
                    const details = {title,rows: [{label: labels[i],value: formatter(value),color}]};
                    const hitWidth = Math.min(w,Math.max(8,bw)), hitHeight = Math.min(h,Math.max(8,bh));
                    return <g key={`${row.key}-${i}`}>
                        <Bar x={bx} y={by} width={bw} height={bh} fill={color} pointerEvents="none"/>
                        {!preview && <rect x={Math.max(0,Math.min(w-hitWidth,bx+(bw-hitWidth)/2))} y={Math.max(0,Math.min(h-hitHeight,by+(bh-hitHeight)/2))} width={hitWidth} height={hitHeight} fill="transparent"
                            tabIndex={0} role="img" aria-label={`${title} · ${details.rows[0].label}: ${formatter(value)}`}
                            onPointerMove={event => tooltip.show({...details,clientX: event.clientX,clientY: event.clientY})}
                            onPointerDown={event => tooltip.show({...details,clientX: event.clientX,clientY: event.clientY})}
                            onFocus={() => tooltip.show({...details,...tooltip.position(margin.left+bx+bw/2,margin.top+by)})} onBlur={tooltip.close}/>}
                    </g>;
                });
            })}
            {!preview && (horizontal ? <>
                <AxisLeft scale={category} tickFormat={categoryLabel} label={chart.x.label ?? chart.x.field} labelProps={{fill: "var(--foreground)", fontSize: 11}} stroke="var(--border)" tickStroke="var(--border)" numTicks={chart.x.tickCount} tickLabelProps={{...tickStyle, angle: chart.x.tickLabelAngle ?? 0}}/>
                <AxisBottom top={h} scale={valueScale} tickFormat={v => formatter(Number(v))} numTicks={chart.yAxis?.tickCount ?? 5} label={chart.yAxis?.label} labelProps={{fill: "var(--foreground)", fontSize: 11}} stroke="var(--border)" tickStroke="var(--border)" tickLabelProps={{...tickStyle, angle: chart.yAxis?.tickLabelAngle ?? 0}}/>
            </> : <>
                <AxisBottom top={h} scale={category} tickFormat={categoryLabel} numTicks={chart.x.tickCount ?? Math.max(2,Math.floor(w / 70))} label={chart.x.label ?? chart.x.field} labelProps={{fill: "var(--foreground)", fontSize: 11}} stroke="var(--border)" tickStroke="var(--border)" tickLabelProps={{...tickStyle, angle: chart.x.tickLabelAngle ?? 0}}/>
                <AxisLeft scale={valueScale} tickFormat={v => formatter(Number(v))} numTicks={chart.yAxis?.tickCount ?? 5} label={chart.yAxis?.label} labelProps={{fill: "var(--foreground)", fontSize: 11}} stroke="var(--border)" tickStroke="var(--border)" tickLabelProps={{...tickStyle, angle: chart.yAxis?.tickLabelAngle ?? 0}}/>
            </>)}
        </g>
    </svg>{!preview && <VisualizationTooltip data={tooltip.data}/>}</>;
});
