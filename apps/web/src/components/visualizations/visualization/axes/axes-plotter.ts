import {ArCabildoabiertoEmbedVisualization} from "@cabildo-abierto/api"
import {ScaleBand, ScaleLinear, ScaleTime} from "d3-scale";
import {scaleBand, scaleLinear, scaleTime} from "@visx/scale";
import {orderDateAsc, orderNumberAsc, orderStrAsc, sortByKey} from "@cabildo-abierto/utils";
import {Axis, DataType, Plotter, ScaleOutput, ValueType} from "../plotter";
import {palette} from "../palette";
import {DatasetForTableView} from "@/components/visualizations/visualization/table/types";
import {AggregationLevel, getDateFormatterForAggregation} from "@/components/visualizations/visualization/data-parser";


function dataTypeToPrintable(x: DataType){
    if(x == "string") return "cadena de caracteres"
    if(x == "number") return "número"
    if(x == "date") return "fecha"
    if(x == "string[]") return "lista"
    if(!x) return "indefinido"
    throw Error(`Tipo de datos inválido: ${x}`)
}


export class AxesPlotter extends Plotter {
    protected plotType: string;
    protected axes: Axis[] = []
    protected xAxis: Axis

    constructor(spec: ArCabildoabiertoEmbedVisualization.Main["spec"], dataset: DatasetForTableView, filters?: ArCabildoabiertoEmbedVisualization.Main["filters"]) {
        super(spec, dataset, filters)

        if (ArCabildoabiertoEmbedVisualization.isTwoAxisPlot(spec) || ArCabildoabiertoEmbedVisualization.isOneAxisPlot(spec)) {
        } else {
            throw Error(`Axis plot desconocido: ${spec.$type}`)
        }

        this.plotType = spec.plot.$type;
    }

    prepareForPlot(prev?: Plotter): { error?: string } {
        super.prepareForPlot(prev)
        if (ArCabildoabiertoEmbedVisualization.isTwoAxisPlot(this.spec) || ArCabildoabiertoEmbedVisualization.isOneAxisPlot(this.spec)) {
            const detectedType = this.columnTypes.get(this.spec.xAxis)
            this.axes.push({
                name: "x",
                column: this.spec.xAxis,
                detectedType
            })
            this.xAxis = this.axes.find(a => a.name == "x")
        }
        return {}
    }


    public getAxisType(axis: string) {
        const obj = this.axes.find(a => a.name === axis)
        if (!obj) throw Error(`No se encontró el eje ${axis}.`)
        return obj.detectedType
    }

    public getScale(axis: string, innerMeasure: number): ScaleOutput {
        const {domain, error} = this.getDomain(axis)
        if(error) return {error}

        if (this.isHistogram() && axis == "y") {
            const res: ScaleLinear<number, number> = scaleLinear({
                domain: domain as number[],
                range: [innerMeasure, 0],
                nice: true,
            });
            return {
                scale: res,
                tickCount: res.ticks().length,
                config: {type: "linear"}
            }
        }

        const type = this.getAxisType(axis)
        if ((this.isBarplot() || this.isHistogram()) && axis == 'x') {
            const res: ScaleBand<string> = scaleBand<string>({
                domain: domain as string[],
                range: [0, innerMeasure],
                padding: 0.2,
            })

            return {
                scale: res,
                tickCount: res.domain().length,
                config: {type: "band"}
            }
        }

        if (type === 'number') {
            const res: ScaleLinear<number, number> = scaleLinear({
                domain: domain as number[],
                range: axis === 'x' ? [0, innerMeasure] : [innerMeasure, 0],
                nice: true,
            });
            return {
                scale: res,
                tickCount: res.ticks().length,
                config: {type: "linear"}
            }
        }

        if (type === 'date') {
            const res: ScaleTime<number, number> = scaleTime({
                domain: domain as Date[],
                range: [0, innerMeasure],
                nice: true
            });
            return {
                scale: res,
                tickCount: res.ticks().length,
                config: {type: "time"}
            }
        }

        return {
            error: `El tipo de gráfico no es compatible con el tipo de dato del eje "${axis}": ${dataTypeToPrintable(type)}`
        }
    }

    public getDomain(axis: string): {domain?: [number, number] | [Date, Date] | string[], error?: string} {
        const values = this.dataPoints.map((d) => d[axis])
        if (this.isHistogram() && axis == "y") {
            const nums = removeNulls(values as number[])
            return {
                domain: [0, Math.max(...nums)]
            }
        }

        function removeNulls(a: number[]) {
            return a.filter(x => x != null && !isNaN(x))
        }

        const type = this.getAxisType(axis)

        if ((this.isBarplot() || this.isHistogram()) && type === "number") {
            if (axis === 'y') {
                const nums = removeNulls(values as number[])
                return {domain: [0, Math.max(...nums)]}
            }
            if (axis === 'x') {
                const xValues = this.dataPoints.map((d) => d.x as number)
                return {domain: [Math.min(...xValues), Math.max(...xValues)]}
            }
        }

        if (type === "number") {
            const nums = removeNulls(values as number[])
            return {domain: [Math.min(...nums), Math.max(...nums)]}
        }

        if (type === "date") {
            const dates = values as Date[];
            const minDate = new Date(Math.min(...dates.map(d => d.getTime()).filter(x => !isNaN(x))))
            const maxDate = new Date(Math.max(...dates.map(d => d.getTime()).filter(x => !isNaN(x))))
            return {domain: [minDate, maxDate]}
        }

        if (type === "string") {
            return {
                domain: this.dataPoints.map((d) => d.x as string)
            }
        }

        return {error: `Tipo de datos del eje ${axis} no soportado para este gráfico: ${type}.`}
    }

    isBarplot(): boolean {
        return this.plotType === "ar.cabildoabierto.embed.visualization#barplot"
    }

    isHistogram(): boolean {
        return this.plotType === "ar.cabildoabierto.embed.visualization#histogram"
    }

    isCurvePlot(): boolean {
        return this.plotType === "ar.cabildoabierto.embed.visualization#lines"
    }

    isScatterPlot(): boolean {
        return this.plotType === "ar.cabildoabierto.embed.visualization#scatterplot"
    }

    xValueToString(x: ValueType, precision?: number): string {
        return this.valueToString(x, this.getAxisType("x"), precision)
    }

    yValueToString(y: ValueType): string {
        throw Error("Debería estar implementado por una subclase.")
    }

    getXTicksFormat(aggregationLevel: AggregationLevel) {
        const isDateXAxis = this.getAxisType('x') === 'date'
        if (aggregationLevel !== 'original' && isDateXAxis) {
            return getDateFormatterForAggregation(aggregationLevel)
        }
        const detectedType = this.axes.find(a => a.name === "x")?.detectedType
        if (detectedType !== "date" || !this.dataPoints.length) return undefined

        return this.parser.getDateFormaterFromDateArray(this.dataPoints.map(d => d.x as Date))
    }

    protected sortByX(): void {
        const detectedType = this.xAxis.detectedType

        if (detectedType == "number") {
            this.dataPoints = sortByKey(this.dataPoints, d => d.x, orderNumberAsc)
        } else if (detectedType == "date") {
            this.dataPoints = sortByKey(this.dataPoints, d => d.x, orderDateAsc)
        } else if (detectedType == "string") {
            this.dataPoints = sortByKey(this.dataPoints, d => d.x, orderStrAsc)
        }
    }

    protected sortByY(): void {
        const detectedType = this.axes.find(a => a.name == "y")?.detectedType
        if (!detectedType) {
            throw Error("No se encontró el eje y!")
        }
        if (detectedType == "number") {
            this.dataPoints = sortByKey(this.dataPoints, d => d.y, orderNumberAsc)
        } else if (detectedType == "date") {
            this.dataPoints = sortByKey(this.dataPoints, d => d.y, orderDateAsc)
        } else if (detectedType == "string") {
            this.dataPoints = sortByKey(this.dataPoints, d => d.y, orderStrAsc)
        }
    }

    public getTooltipYValues(tooltipData: { x: ValueType, y: ValueType }): {
        label: string,
        value: string,
        selected: boolean
    }[] {
        throw Error("Debería estar implementado por una subclase!")
    }

    public getLabelColor(label: string): string {
        return palette(0)
    }
}