import {scaleBand, ScaleConfig, scaleTime} from "@visx/scale";
import {scaleLinear} from "@visx/scale";
import {ScaleBand, ScaleLinear, ScaleTime} from "d3-scale";
import {useTooltip} from "@visx/tooltip";
import {AxisScaleOutput} from "@visx/axis";
import {
    isOneAxisPlot, isTable,
    isTwoAxisPlot,
    Main as Visualization
} from "@/lex-api/types/ar/cabildoabierto/embed/visualization"
import {DataParser} from "@/components/visualizations/editor/data-parser";
import { timeFormatLocale } from 'd3-time-format'
import {Column} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {DatasetForTableView, DatasetSortOrder} from "@/components/datasets/dataset-table-view";
import {cleanText} from "@/utils/strings";
import {count, orderDateAsc, orderNumberAsc, orderStrAsc, sortByKey} from "@/utils/arrays";

export const esLocale = timeFormatLocale({
    dateTime: '%A, %e de %B de %Y, %X',
    date: '%d/%m/%Y',
    time: '%H:%M:%S',
    periods: ['', ''],
    days: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    shortDays: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
    months: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
        'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    shortMonths: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul',
        'ago', 'sep', 'oct', 'nov', 'dic']
})

export type DataRow = Record<string, any>
export type DataPoint<X=ValueType, Y=ValueType> = {x: X, y: Y, color?: string}
export type TooltipHookType = ReturnType<typeof useTooltip>

export type DataType = "number" | "string" | "date" | "string[]" | null
export type ValueType = string | number | Date | string[] | null
export type ScaleOutput = {
    scale?: ScaleBand<string> | ScaleLinear<number, number> | ScaleTime<number, number>
    error?: string
    tickCount?: number
    config?: ScaleConfig<AxisScaleOutput, any, any>
}

type Axis = {
    name: string
    column: string
    detectedType: DataType
}

export class Plotter {
    protected data: DataRow[] = [];
    public dataPoints: DataPoint[] = [];
    public parser: DataParser = new DataParser()
    public columns: Column[]
    protected columnNames: string[]
    protected spec: Visualization["spec"]
    protected dataset: DatasetForTableView

    constructor(
        spec: Visualization["spec"],
        dataset: DatasetForTableView
    ) {
        this.spec = spec
        this.columns = dataset.columns
        this.columnNames = this.columns.map(c => c.name).sort()
        this.dataset = dataset
    }

    preprocessRawData(rawData: string): DataRow[] {
        const parsed = JSON.parse(rawData)
        return (parsed as DataRow[]).filter(x => this.validRow(x))
    }

    validRow(x: DataRow): boolean {
        const keys = Object.keys(x)
        return keys.length == this.columnNames.length
    }

    public prepareForPlot(prev?: Plotter): {error?: string} {
        this.data = this.preprocessRawData(this.dataset.data)
        return {}
    }

    public getDataPoints(): DataPoint[] {
        if(!this.dataPoints) throw Error("Ocurrió un error al construir el gráfico.")
        return this.dataPoints;
    }

    protected valueToString(v: ValueType, type: DataType, precision: number = 2): string {
        if(type == "string"){
            return v as string
        } else if(type == "date"){
            if(v instanceof Date){
                const formater = this.parser.getDateFormater(v)
                return formater(v)
            } else {
                return `Fecha inválida: ${v.toString()}`
            }
        } else if(type == "number"){
            return Number(v).toFixed(precision).toString()
        } else if(type == "string[]"){
            return (v as string[]).join(", ")
        }
    }
}


export class AxesPlotter extends Plotter {
    protected plotType: string;
    protected axes: Axis[] = []
    protected xAxis: Axis

    static create(spec: Visualization["spec"], dataset: DatasetForTableView): AxesPlotter {
        if(isOneAxisPlot(spec)) {
            return new OneAxisPlotter(spec, dataset)
        } else if(isTwoAxisPlot(spec)) {
            return new TwoAxisPlotter(spec, dataset)
        } else {
            throw new Error("Sin implementar!");
        }
    }

    constructor(spec: Visualization["spec"], dataset: DatasetForTableView) {
        super(spec, dataset)

        if(isTwoAxisPlot(spec) || isOneAxisPlot(spec)){
        } else {
            throw Error(`Axis plot desconocido: ${spec.$type}`)
        }

        this.plotType = spec.plot.$type;
    }


    prepareForPlot(prev?: Plotter): { error?: string } {
        super.prepareForPlot(prev)
        if(isTwoAxisPlot(this.spec) || isOneAxisPlot(this.spec)){
            const detectedType = this.parser.guessType(this.data, this.spec.xAxis)
            this.axes.push({
                name: "x",
                column: this.spec.xAxis,
                detectedType
            })
            this.xAxis = this.axes.find(a => a.name == "x")
        }
        return {}
    }


    public getAxisType(axis: string){
        const obj = this.axes.find(a => a.name === axis)
        if(!obj) throw Error(`No se encontró el eje ${axis}.`)
        return obj.detectedType
    }

    public getScale(axis: string, innerMeasure: number): ScaleOutput {
        const domain = this.getDomain(axis)

        if(this.isHistogram() && axis == "y") {
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
            error: `El tipo de gráfico no es compatible con el tipo de dato del eje "${axis}"`
        }
    }

    public getDomain(axis: string): [number, number] | [Date, Date] | string[]{
        const values = this.dataPoints.map((d) => d[axis])
        if(this.isHistogram() && axis == "y"){
            const nums = removeNulls(values as number[])
            return [0, Math.max(...nums)]
        }

        function removeNulls(a: number[]){
            return a.filter(x => x != null && !isNaN(x))
        }

        const type = this.getAxisType(axis)

        if ((this.isBarplot() || this.isHistogram()) && type === "number") {
            if (axis === 'y'){
                const nums = removeNulls(values as number[])
                return [0, Math.max(...nums)]
            }
            if (axis === 'x'){
                const xValues = this.dataPoints.map((d) => d.x as number)
                return [Math.min(...xValues), Math.max(...xValues)]
            }
        }

        if (type === "number") {
            const nums = removeNulls(values as number[])
            return [Math.min(...nums), Math.max(...nums)]
        }

        if (type === "date") {
            const dates = values as Date[];
            const minDate = new Date(Math.min(...dates.map(d => d.getTime()).filter(x => !isNaN(x))))
            const maxDate = new Date(Math.max(...dates.map(d => d.getTime()).filter(x => !isNaN(x))))
            return [minDate, maxDate]
        }

        if (type === "string") {
            return this.dataPoints.map((d) => d.x as string)
        }

        throw new Error(`Tipo de datos del eje ${axis} no soportado para este gráfico: ${type}.`);
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

    getXTicksFormat() {
        const detectedType = this.axes.find(a => a.name === "x")?.detectedType
        if (detectedType !== "date" || !this.dataPoints.length) return undefined

        return this.parser.getDateFormater(this.dataPoints[0].x as Date)
    }

    protected sortByX(): void {
        const detectedType = this.xAxis.detectedType

        if(detectedType == "number"){
            this.dataPoints = sortByKey(this.dataPoints, d => d.x, orderNumberAsc)
        } else if(detectedType == "date"){
            this.dataPoints = sortByKey(this.dataPoints, d => d.x, orderDateAsc)
        } else if(detectedType == "string"){
            this.dataPoints = sortByKey(this.dataPoints, d => d.x, orderStrAsc)
        }
    }

    protected sortByY(): void {
        const detectedType = this.axes.find(a => a.name == "y")?.detectedType
        if(!detectedType){
            throw Error("No se encontró el eje y!")
        }
        if(detectedType == "number"){
            this.dataPoints = sortByKey(this.dataPoints, d => d.y, orderNumberAsc)
        } else if(detectedType == "date"){
            this.dataPoints = sortByKey(this.dataPoints, d => d.y, orderDateAsc)
        } else if(detectedType == "string"){
            this.dataPoints = sortByKey(this.dataPoints, d => d.y, orderStrAsc)
        }
    }

    public getTooltipYValues(tooltipData: {x: ValueType, y: ValueType}): {label: string, value: string, selected: boolean}[] {
        throw Error("Debería estar implementado por una subclase!")
    }
}


export class OneAxisPlotter extends AxesPlotter {

    constructor(spec: Visualization["spec"], dataset: DatasetForTableView) {
        super(spec, dataset)
    }

    public prepareForPlot(prev?: Plotter) {
        super.prepareForPlot(prev)
        const counts = new Map<ValueType, number>()
        this.data.forEach(row => {
            const v = this.parser.rawValueToDetectedType(row[this.xAxis.column], this.xAxis.detectedType)
            if(v == null) return
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

        if(this.isHistogram()) {
            if(this.data.length > 100){
                return {error: `El gráfico tiene demasiadas barras (${this.data.length}). Revisá la configuración.`}
            }
        }
        return {}
    }

    yValueToString(y: ValueType): string {
        const precision = isTwoAxisPlot(this.spec) ? this.spec.dimensions?.yAxisPrecision : undefined
        return this.valueToString(y, "number", precision)
    }

    public getTooltipYValues(tooltipData: {x: ValueType, y: ValueType}): {label: string, value: string, selected: boolean}[] {
        return [{label: undefined, value: this.yValueToString(tooltipData.y), selected: true}]
    }
}


export class TwoAxisPlotter extends AxesPlotter {
    private yAxes: Axis[]
    private xToYMap: Map<ValueType, {value: ValueType, color: string}[]> = new Map()

    constructor(spec: Visualization["spec"], dataset: DatasetForTableView) {
        super(spec, dataset)
    }

    private createDataPoints(): void {
        this.dataPoints = this.data.flatMap(row => {
            let x: ValueType = this.parser.rawValueToDetectedType(row[this.xAxis.column], this.xAxis.detectedType)

            return this.yAxes.map(ax => {
                return {
                    x,
                    y: this.parser.rawValueToDetectedType(row[ax.column], ax.detectedType),
                    color: this.yAxes.length > 1 ? ax.column : undefined
                }
            })
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

    public prepareForPlot(prev?: Plotter) {
        super.prepareForPlot(prev)

        const spec = this.spec
        if(isTwoAxisPlot(spec)) {
            let yAxisCols: string[] = []
            if(spec.yAxis){
                yAxisCols = [spec.yAxis]
            } else if(spec.yAxes){
                yAxisCols = spec.yAxes.map(a => a.column)
            }
            this.yAxes = yAxisCols.map(c => {
                const detectedType = this.parser.guessType(this.data, c)
                if(detectedType != "number"){
                    throw Error("El eje y debería ser numérico.")
                }
                return {
                    name: "y",
                    column: c,
                    detectedType
                }
            })
            this.axes.push(...this.yAxes)
        } else {
            throw Error("Debería ser un TwoAxisPlot!")
        }

        this.createDataPoints()
        this.groupSameX()
        return {}
    }

    yValueToString(y: ValueType): string {
        const precision = isTwoAxisPlot(this.spec) ? this.spec.dimensions?.yAxisPrecision : undefined
        return this.valueToString(y, this.getAxisType("y"), precision)
    }

    isMultipleYAxis() {
        return count(this.axes, ax => (ax.name == "y")) > 1
    }

    public getTooltipYValues(tooltipData: {x: ValueType, y: ValueType, color: string}): {label: string, value: string, selected: boolean}[] {
        if(this.isMultipleYAxis()){
            return this.xToYMap.get(tooltipData.x)?.map(x => ({
                value: this.yValueToString(x.value),
                label: x.color,
                selected: tooltipData.color == x.color
            })) ?? []
        } else {
            return [{label: undefined, value: this.yValueToString(tooltipData.y), selected: true}]
        }
    }
}


export class TablePlotter extends Plotter {
    private columnTypes: Map<string, DataType> = new Map()
    private sortingBy: DatasetSortOrder | null
    private searchValue: string
    public dataForPlot: DataRow[]
    public strRows: string[][]

    constructor(spec: Visualization["spec"], dataset: DatasetForTableView, sortingBy: DatasetSortOrder | null, searchValue?: string) {
        super(spec, dataset)
        this.sortingBy = sortingBy
        this.searchValue = searchValue
    }

    prepareForPlot(prev?: TablePlotter) {
        super.prepareForPlot(prev)

        if(prev){
            this.columnTypes = prev.columnTypes
        } else {
            if(this.data.length > 0){
                const d0 = this.data[0]
                Object.entries(d0).forEach(([colName, _]) => {
                    const t = this.parser.guessType(this.data, colName)
                    this.columnTypes.set(colName, t)
                })
            }
        }

        if(prev){
            this.strRows = prev.strRows
        } else {
            this.strRows = this.data.map(r => {
                return Array.from(Object.entries(r)).map(([key, value]) => {
                    return cleanText(this.columnValueToString(value, key))
                })
            })
        }

        this.dataForPlot = this.data
        if (this.searchValue && this.searchValue.length > 0) {
            const searchKey = cleanText(this.searchValue)
            this.dataForPlot = this.dataForPlot.filter(((row, index) => {
                return this.strRows[index].some(x => x.includes(searchKey))
            }))
        }
        if(this.sortingBy){
            const col = this.sortingBy.col
            this.dataForPlot = this.dataForPlot.toSorted((a, b) => {
                return (this.sortingBy.order == "desc" ? -1 : 1) * this.cmpValues(col, a[col], b[col])
            })
        }
        return {}
    }

    columnValueToString(value: any, col: string): string {
        const parsed = this.parser.parseValue(value)
        const columns = isTable(this.spec) ? this.spec.columns : undefined
        const column = columns ? columns.find(c => c.columnName == col) : undefined
        if(parsed.success){
            return this.valueToString(parsed.value, parsed.dataType, column?.precision)
        } else if(value == undefined) {
            return "null"
        } else if(typeof value == "string" && value.trim().length == 0) {
            return "null"
        } else {
            return `Valor inválido.`
        }
    }

    cmpValues(col: string, a: any, b: any){
        const type = this.columnTypes.get(col)
        if(type == "string"){
            return (a as string) >= b ? 1 : -1
        } else if(type == "number"){
            return Number(a) >= Number(b) ? 1 : -1
        } else if(type == "date"){
            return new Date(a) >= new Date(b) ? 1 : -1
        } else if(type == "string[]"){
            return 0
        }
    }

    isEmpty(): boolean {
        return this.data.length == 0
    }

    getKeysToHeadersMap(): [string, string][] {
        const res: [string, string][] = []

        if(isTable(this.spec)) {
            const config = this.spec.columns
            if(config && config.length > 0){
                config.forEach(c => {
                    res.push([c.columnName, c.alias ?? c.columnName])
                })
            } else {
                this.columns.forEach(c => {
                    res.push([c.name, c.name])
                })
            }
        }
        return res
    }
}