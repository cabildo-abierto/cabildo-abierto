import {ArCabildoabiertoEmbedVisualization} from "@cabildo-abierto/api"
import {count, unique} from "@cabildo-abierto/utils";
import {Axis, DataPoint, Plotter, ValueType} from "../../plotter";
import {AxesPlotter} from "../axes-plotter";
import {palette} from "../../palette";
import {DatasetForTableView} from "@/components/visualizations/visualization/table/types";
import {
    aggregateDataByDate,
    AggregationLevel,
    detectDateFrequency
} from "@/components/visualizations/visualization/data-parser";


export type TooltipMap = Map<string, { value: number, color: string }[]>


export class TwoAxisPlotter extends AxesPlotter {
    private yAxes: Axis[]
    private colors: Axis[]
    private xToYMap: Map<ValueType, { value: ValueType, color: string }[]> = new Map()
    private colorLabelToColor: Map<string, string> = new Map()

    constructor(
        spec: ArCabildoabiertoEmbedVisualization.Main["spec"],
        dataset: DatasetForTableView, filters?: ArCabildoabiertoEmbedVisualization.Main["filters"]
    ) {
        super(spec, dataset, filters)
    }

    private createDataPoints(): void {
        this.dataPoints = this.data.flatMap(row => {
            let x: ValueType = this.parser.rawValueToDetectedType(row[this.xAxis.column], this.xAxis.detectedType)
            if(x == null) return []

            return this.yAxes.map(ax => {
                let color: string = undefined
                if(this.yAxes.length > 1){
                    color = ax.column
                } else if(this.colors && this.colors.length > 0){
                    const colorCol = this.colors[0].column
                    color = row[colorCol]
                }

                const y = this.parser.rawValueToDetectedType(row[ax.column], ax.detectedType)

                if(y == null) return null

                return {
                    x,
                    y,
                    color
                }
            }).filter(x => x != null)
        })
    }

    private groupSameX(): void {
        const grouped = new Map<string | number | Date, Map<string, number[]>>()

        this.dataPoints.forEach((d) => {
            if (d.x != null && !(d.x instanceof Array)) {
                const m = grouped.get(d.x) ?? new Map<string, number[]>
                m.set(d.color, [...(m.get(d.color) ?? []), d.y as number])

                grouped.set(d.x, m)
            }
        });

        this.dataPoints = Array.from(grouped.entries()).flatMap(([x, colors]) => {
            return Array.from(colors.entries()).map(([color, ys]) => {
                return {
                    x: x,
                    y: ys.reduce((sum, val) => sum + val, 0) / ys.length,
                    color
                }
            })
        })

        this.xToYMap = new Map()
        this.dataPoints.forEach(d => {
            this.xToYMap.set(d.x, [...(this.xToYMap.get(d.x) ?? []), {color: d.color, value: d.y}])
        })
    }

    createAxes() {
        const spec = this.spec
        if (ArCabildoabiertoEmbedVisualization.isTwoAxisPlot(spec)) {
            let yAxisCols: string[] = []
            if (spec.yAxis) {
                yAxisCols = [spec.yAxis]
            } else if (spec.yAxes) {
                yAxisCols = spec.yAxes.map(a => a.column)
            }
            this.yAxes = yAxisCols.map(c => {
                const detectedType = this.columnTypes.get(c)
                if (detectedType != "number") {
                    throw Error(`El eje y debería ser numérico pero es: ${detectedType}.`)
                }
                return {
                    name: "y",
                    column: c,
                    detectedType
                }
            })
            if(spec.colors){
                this.colors = spec.colors.map(c => {
                    const detectedType = this.columnTypes.get(c.column)
                    if (detectedType != "string") {
                        throw Error("La columna del color debería ser categórica.")
                    }
                    return {
                        name: "color",
                        column: c.column,
                        detectedType
                    }
                })
            }
            this.axes.push(...this.yAxes)
        } else {
            throw Error("Debería ser un TwoAxisPlot!")
        }
    }

    assignColors() {
        const colorLabels = unique(this.dataPoints
            .map(d => d.color)
            .filter(x => x != null))
        colorLabels.forEach((label, index) => {
            this.colorLabelToColor.set(label, palette(index))
        })
    }

    public prepareForPlot(prev?: Plotter) {
        super.prepareForPlot(prev)
        this.createAxes()
        this.createDataPoints()
        this.assignColors()
        this.groupSameX()
        return {}
    }

    yValueToString(y: ValueType): string {
        const precision = ArCabildoabiertoEmbedVisualization.isTwoAxisPlot(this.spec) ? this.spec.dimensions?.yAxisPrecision : undefined
        return this.valueToString(y, this.getAxisType("y"), precision)
    }

    isMultipleYAxis() {
        return count(this.axes, ax => (ax.name == "y")) > 1
    }

    public getTooltipYValues(tooltipData: { x: ValueType, y: ValueType, color: string }): {
        label: string,
        value: string,
        selected: boolean
    }[] {
        if (this.isMultipleYAxis() || this.colors && this.colors.length > 0) {
            return this.xToYMap.get(tooltipData.x)?.map(x => ({
                value: this.yValueToString(x.value),
                label: x.color,
                selected: tooltipData.color == x.color
            })) ?? []
        } else {
            return [
                {
                    label: undefined,
                    value: this.yValueToString(tooltipData.y),
                    selected: true
                }
            ]
        }
    }

    public getLabelColor(label: string) {
        if(!label || label.length == 0) return palette(0)
        return this.colorLabelToColor.get(label)
    }

    public getColorLabels(): string[] {
        return Array.from(this.colorLabelToColor.keys())
    }

    public getAvailableAggregationLevels(): AggregationLevel[] {
        const rawData = this.getDataPoints()
        const isDateXAxis = this.getAxisType('x') === 'date'
        if (!isDateXAxis || rawData.length < 2) return ['original'] as AggregationLevel[]
        const dates = rawData.map(d => d.x as Date).filter(d => d instanceof Date)
        if (dates.length < 2) return ['original'] as AggregationLevel[]
        const frequency = detectDateFrequency(dates)

        switch (frequency) {
            case 'sub-day':
                return ['original', 'day', 'month', 'year']
            case 'day':
                return ['original', 'month', 'year']
            case 'month':
                return ['original', 'year']
            case 'year':
                return ['original']
        }
    }

    public getAggregatedTooltipMap(aggregationLevel: AggregationLevel): {data: DataPoint<ValueType, ValueType>[], aggregatedTooltipMap: TooltipMap} {
        const rawData = this.getDataPoints()
        const isDateXAxis = this.getAxisType('x') === 'date'
        if (!isDateXAxis || aggregationLevel === 'original') {
            return {data: rawData, aggregatedTooltipMap: null}
        }
        const aggregatedData = aggregateDataByDate(rawData as DataPoint<Date, number>[], aggregationLevel)

        // Build a map for tooltip values from aggregated data
        const tooltipMap = new Map<string, { value: number, color: string }[]>()
        aggregatedData.forEach(d => {
            const key = (d.x as Date).getTime().toString()
            const entry = {value: d.y as number, color: d.color}
            tooltipMap.set(key, [...(tooltipMap.get(key) ?? []), entry])
        })

        return {data: aggregatedData, aggregatedTooltipMap: tooltipMap}
    }
}


export function isTwoAxisPlotter(plotter: Plotter): plotter is TwoAxisPlotter {
    return plotter instanceof TwoAxisPlotter
}