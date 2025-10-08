import {ArCabildoabiertoEmbedVisualization} from "@/lex-api/index"
import {DatasetForTableView} from "@/components/visualizations/datasets/dataset-table-view";
import {count, unique} from "@/utils/arrays";
import {Axis, Plotter, ValueType} from "@/components/visualizations/editor/plotter/plotter";
import {AxesPlotter} from "@/components/visualizations/editor/plotter/axes-plotter";
import {palette} from "@/components/visualizations/palette";

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
                        throw Error("La columna para el color debería ser categórica.")
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
}


export function isTwoAxisPlotter(plotter: Plotter): plotter is TwoAxisPlotter {
    return plotter instanceof TwoAxisPlotter
}