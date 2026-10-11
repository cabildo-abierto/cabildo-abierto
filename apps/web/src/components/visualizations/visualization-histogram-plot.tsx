import type {HistogramChart} from '@cabildo-abierto/api';
import type {BarRow} from '@cabildo-abierto/utils';
import {VisualizationBarPlot} from './visualization-bar-plot';
import {VisualizationNumericHistogramPlot} from './visualization-numeric-histogram-plot';

export function VisualizationHistogramPlot({chart, rows, width, height, preview = false}: {
    chart: HistogramChart; rows: BarRow[]; width: number; height: number; preview?: boolean;
}) {
    if (rows.some(row => row.interval)) return <VisualizationNumericHistogramPlot chart={chart} rows={rows} width={width} height={height} preview={preview}/>;
    return <VisualizationBarPlot ariaLabel="Histograma" chart={{
        type: 'bar', x: chart.x, series: [{field: chart.x.field}], showGrid: chart.showGrid,
        yAxis: {...chart.yAxis, format: chart.yAxis?.format ?? (chart.frequency === 'relative' ? {type: 'percent'} : undefined)},
    }} rows={rows} labels={['Frecuencia']} width={width} height={height} preview={preview}/>;
}
