import {ScaleConfig} from "@visx/scale";
import {ScaleBand, ScaleLinear, ScaleTime} from "d3-scale";
import {useTooltip} from "@visx/tooltip";
import {AxisScaleOutput} from "@visx/axis";
import {
    ColumnFilter,
    isColumnFilter,
    Main as Visualization
} from "@/lex-api/types/ar/cabildoabierto/embed/visualization"
import {DataParser} from "@/components/visualizations/editor/plotter/data-parser";
import {Column} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {DatasetForTableView} from "@/components/datasets/dataset-table-view";

export type DataRow = Record<string, any>
export type DataPoint<X=ValueType, Y=ValueType> = {
    x: X
    y: Y
    color?: string
}
export type TooltipHookType = ReturnType<typeof useTooltip>

export type DataType = "number" | "string" | "date" | "string[]" | null
export type ValueType = string | number | Date | string[] | null
export type ScaleOutput = {
    scale?: ScaleBand<string> | ScaleLinear<number, number> | ScaleTime<number, number>
    error?: string
    tickCount?: number
    config?: ScaleConfig<AxisScaleOutput, any, any>
}

export type Axis = {
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
    public spec: Visualization["spec"]
    public dataset: DatasetForTableView
    protected filters: Visualization["filters"]
    protected columnTypes: Map<string, DataType> = new Map()

    constructor(
        spec: Visualization["spec"],
        dataset: DatasetForTableView,
        filters?: Visualization["filters"]
    ) {
        this.spec = spec
        this.filters = filters
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

    checkFilter(f: ColumnFilter){
        return (r: DataRow): boolean => {
            if(f.operator == "includes"){
                const type = this.columnTypes.get(f.column)
                const v = this.parser.parseValue(r[f.column], type)
                if(v.success && v.dataType == "string[]"){
                    const x = v.value
                    return !f.operands.some(op => !x.includes(op))
                }
            } else if(f.operator == "=") {
                const type = this.columnTypes.get(f.column)
                const v = this.parser.parseValue(r[f.column], type)
                if(v.success && f.operands && f.operands.length > 0){
                    return f.operands[0] == v.value
                }
                return false
            } else if(f.operator == "in"){
                const type = this.columnTypes.get(f.column)
                const v = this.parser.parseValue(r[f.column], type)
                const operands = f.operands?.map(o => {
                    const v = this.parser.parseValue(o, type)
                    if(v.success){
                        return v.value
                    } else {
                        return null
                    }
                })?.filter(x => x != null)
                if(v.success && operands && operands.length > 0){
                    return operands.includes(v.value)
                }
                return false
            }
        }
    }

    applyFilters(){
        if(this.filters){
            for(const f of this.filters){
                if(isColumnFilter(f)){
                    this.data = this.data.filter(this.checkFilter(f))
                }
            }
        }
    }

    public prepareForPlot(prev?: Plotter): {error?: string} {
        this.data = this.preprocessRawData(this.dataset.data)

        if (prev) {
            this.columnTypes = prev.columnTypes
        } else {
            if (this.data.length > 0) {
                const d0 = this.data[0]
                Object.entries(d0).forEach(([colName, _]) => {
                    const t = this.parser.guessType(this.data, colName)
                    this.columnTypes.set(colName, t)
                })
            }
        }

        this.applyFilters()
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