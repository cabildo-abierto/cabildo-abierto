import {ArCabildoabiertoEmbedVisualization} from "@cabildo-abierto/api"
import {Plotter, ValueType} from "../../plotter";
import {AxesPlotter} from "../axes-plotter";
import {DatasetForTableView} from "@/components/visualizations/visualization/table/types";


export class OneAxisPlotter extends AxesPlotter {

    constructor(spec: ArCabildoabiertoEmbedVisualization.Main["spec"], dataset: DatasetForTableView, filters?: ArCabildoabiertoEmbedVisualization.Main["filters"]) {
        super(spec, dataset, filters)
    }

    public prepareForPlot(prev?: Plotter) {
        super.prepareForPlot(prev)
        const counts = new Map<ValueType, number>()
        this.data.forEach(row => {
            const v = this.parser.rawValueToDetectedType(row[this.xAxis.column], this.xAxis.detectedType)
            if (v == null) return
            counts.set(v, (counts.get(v) ?? 0) + 1)
        })

        this.dataPoints = Array.from(counts.entries()).map(([v, c]) => ({x: v, y: c}))
        this.axes.push({
            column: "count",
            detectedType: "number",
            name: "y"
        })

        this.sortByX()
        this.sortByY()

        if (this.isHistogram()) {
            if (this.dataPoints.length > 100) {
                return {error: `El gráfico tiene demasiadas barras (${this.dataPoints.length}). Revisá la configuración.`}
            }
        }
        return {}
    }

    yValueToString(y: ValueType): string {
        const precision = ArCabildoabiertoEmbedVisualization.isTwoAxisPlot(this.spec) ? this.spec.dimensions?.yAxisPrecision : undefined
        return this.valueToString(y, "number", precision)
    }

    public getTooltipYValues(tooltipData: { x: ValueType, y: ValueType }): {
        label: string,
        value: string,
        selected: boolean
    }[] {
        return [{label: undefined, value: this.yValueToString(tooltipData.y), selected: true}]
    }
}