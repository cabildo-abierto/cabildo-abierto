import {scaleBand, ScaleConfig, scaleTime} from "@visx/scale";
import {scaleLinear} from "@visx/scale";
import {formatIsoDate} from "@/utils/dates";
import {ScaleBand, ScaleLinear, ScaleTime} from "d3-scale";
import {useTooltip} from "@visx/tooltip";
import {AxisScaleOutput} from "@visx/axis";
import {
    isOneAxisPlot, isTable,
    isTwoAxisPlot,
    Main as Visualization
} from "@/lex-api/types/ar/cabildoabierto/embed/visualization"

type DataRow = Record<string, any>
export type DataPoint = {x: any, y: any}
export type TooltipHookType = ReturnType<typeof useTooltip>

function guessType(data: DataRow[], col: string): DataType {
    let numCount = 0
    let dateCount = 0
    let stringCount = 0
    let stringListCount = 0

    const sampleSize = Math.min(20, data.length)
    for (let i = 0; i < sampleSize; i++) {
        const value = data[i][col]

        if(value instanceof Array){
            stringListCount ++
            continue
        }

        if (value == null || value === '') continue;
        if (!isNaN(Number(value))) {
            numCount++
            continue
        }
        const parsedDate = new Date(value)
        if (!isNaN(parsedDate.getTime())) {
            dateCount++
            continue
        }
        stringCount++
    }

    const maxCount = Math.max(numCount, dateCount, stringCount, stringListCount)
    if (maxCount === 0) return null
    if (maxCount === numCount && dateCount === 0 && stringCount === 0 && stringListCount === 0) return "number"
    if (maxCount === dateCount && numCount === 0 && stringCount === 0 && stringListCount === 0) return "date"
    if (maxCount === stringListCount && numCount === 0 && dateCount === 0 && stringCount == 0) return "string[]"
    return "string"
}

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

    constructor(
        rawData: string,
        spec: Visualization["spec"]
    ) {
        this.data = JSON.parse(rawData);
    }

    public prepareForPlot(){
        throw Error("Debería estar implementado por una subclase.")
    }

    public getDataPoints(): DataPoint[] {
        if(!this.dataPoints) throw Error("Ocurrió un error al construir el gráfico.")
        return this.dataPoints;
    }

    protected valueToString(v: ValueType, type: DataType): string {
        if(type == "string"){
            return v as string
        } else if(type == "date"){
            return formatIsoDate(v as Date)
        } else if(type == "number"){
            return Number(v).toFixed(2).toString()
        } else if(type == "string[]"){
            return (v as string[]).join(", ")
        }
    }

    protected rawValueToDetectedType(v: any, type: DataType): ValueType | null {
        if(v == undefined){
            return null
        }
        if (type === "number") {
            return parseFloat(v)
        } else if (type === "date") {
            const date = new Date(v)
            if(!(date instanceof Date) || date.toString() == "Invalid Date"){
                return null
            }
            return date
        } else {
            return String(v)
        }
    }

    protected sortByX(): void {
        this.dataPoints.sort((a, b) => a.x - b.x);
    }

    protected sortByY(): void {
        this.dataPoints.sort((a, b) => b.y - a.y);
    }
}


export class AxesPlotter extends Plotter {
    protected plotType: string;
    protected axes: Axis[] = []

    static create(rawData: string, spec: Visualization["spec"]): AxesPlotter {
        if(isOneAxisPlot(spec)) {
            return new OneAxisPlotter(rawData, spec)
        } else if(isTwoAxisPlot(spec)) {
            return new TwoAxisPlotter(rawData, spec)
        } else {
            throw new Error("Sin implementar!");
        }
    }

    constructor(rawData: string, spec: Visualization["spec"]) {
        super(rawData, spec)

        if(isTwoAxisPlot(spec) || isOneAxisPlot(spec)){
            this.axes.push({
                name: "x",
                column: spec.xAxis,
                detectedType: guessType(this.data, spec.xAxis)
            })
        } else {
            throw Error(`Axis plot desconocido: ${spec.$type}`)
        }

        this.plotType = spec.plot.$type;
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
            return [0, Math.max(...values as number[])]
        }

        const type = this.getAxisType(axis)

        if ((this.isBarplot() || this.isHistogram()) && type === "number") {
            if (axis === 'y'){
                const nums = values as number[];
                return [0, Math.max(...nums)]
            }
            if (axis === 'x'){
                return this.dataPoints.map((d) => d.x)
            }
        }

        if (type === "number") {
            const nums = values as number[];
            return [Math.min(...nums), Math.max(...nums)];
        }

        if (type === "date") {
            const dates = values as Date[];
            const minDate = new Date(Math.min(...dates.map(d => d.getTime()).filter(x => !isNaN(x))))
            const maxDate = new Date(Math.max(...dates.map(d => d.getTime()).filter(x => !isNaN(x))))
            return [minDate, maxDate]
        }

        if (type === "string") {
            return this.dataPoints.map((d) => d.x)
        }

        throw new Error("Scale only supported for number, date or string axes");
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

    xValueToString(x: ValueType): string {
        return this.valueToString(x, this.getAxisType("x"));
    }

    yValueToString(y: ValueType): string {
        throw Error("Debería estar implementado por una subclase.")
    }
}


export class OneAxisPlotter extends AxesPlotter {
    private xAxis: Axis

    constructor(rawData: string, spec: Visualization["spec"]) {
        super(rawData, spec)
        this.xAxis = this.axes.find(a => a.name == "x")
    }

    public prepareForPlot() {
        const counts = new Map<ValueType, number>()
        this.data.forEach(row => {
            const v = this.rawValueToDetectedType(row[this.xAxis.column], this.xAxis.detectedType)
            if(v == null) return
            counts.set(v, (counts.get(v) ?? 0) + 1)
        })

        this.dataPoints = Array.from(counts.entries()).map(([v, c]) => ({x: v, y: c}))

        this.sortByX()
        this.sortByY()
    }

    yValueToString(y: ValueType): string {
        return this.valueToString(y, "number")
    }
}


export class TwoAxisPlotter extends AxesPlotter {
    private xAxis: Axis
    private yAxis: Axis

    constructor(rawData: string, spec: Visualization["spec"]) {
        super(rawData, spec)

        if(isTwoAxisPlot(spec)) {
            this.axes.push({
                name: "y",
                column: spec.yAxis,
                detectedType: guessType(this.data, spec.yAxis)
            })
        } else {
            throw Error("Debería ser un TwoAxisPlot!")
        }

        this.xAxis = this.axes.find(a => a.name == "x")
        this.yAxis = this.axes.find(a => a.name == "y")
    }

    private createDataPoints(): void {
        this.dataPoints = this.data.map(row => {
            let x: ValueType = this.rawValueToDetectedType(row[this.xAxis.column], this.xAxis.detectedType)
            let y: ValueType = this.rawValueToDetectedType(row[this.yAxis.column], this.yAxis.detectedType)

            return { x, y }
        })
    }

    private groupSameX(): void {
        const grouped = new Map<string | number | Date, number[]>();

        this.dataPoints.forEach((d: any) => {
            if (d.x != null && !isNaN(d.y)) {
                grouped.set(d.x, [...(grouped.get(d.x) ?? []), d.y])
            }
        });

        this.dataPoints = Array.from(grouped.entries()).map(([x, ys]) => ({
            x: x,
            y: ys.reduce((sum, val) => sum + val, 0) / ys.length
        }));
    }

    public prepareForPlot() {
        this.createDataPoints()
        this.groupSameX()
        this.sortByX()
        if(this.isBarplot()){
            this.sortByY()
        }
    }

    yValueToString(y: ValueType): string {
        return this.valueToString(y, this.getAxisType("y"))
    }
}


export class TablePlotter extends Plotter {
    private columnTypes: Map<string, DataType> = new Map()

    constructor(rawData: string, spec: Visualization["spec"]) {
        super(rawData, spec)

        if(this.data.length > 0){
            const d0 = this.data[0]
            Object.entries(d0).forEach(([colName, _]) => {
                const t = guessType(this.data, colName)
                this.columnTypes.set(colName, t)
            })
        }
    }

    prepareForPlot() {

    }

    columnValueToString(value: any, col: string): string {
        return this.valueToString(value, this.columnTypes.get(col))
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
}