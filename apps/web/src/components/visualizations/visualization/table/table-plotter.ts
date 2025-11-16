import {ArCabildoabiertoEmbedVisualization} from "@cabildo-abierto/api"
import {DataRow, Plotter} from "../plotter";
import {DatasetForTableView, DatasetSortOrder} from "@/components/visualizations/visualization/table/types";
import {cleanText} from "@cabildo-abierto/utils/dist";


export class TablePlotter extends Plotter {
    private sortingBy: DatasetSortOrder | null
    private searchValue: string
    public dataForPlot: DataRow[]
    public strRows: string[][]
    private columnsMap: Map<string, ArCabildoabiertoEmbedVisualization.TableVisualizationColumn> = new Map()
    private rowsToShow: number | undefined

    constructor(spec: ArCabildoabiertoEmbedVisualization.Main["spec"], dataset: DatasetForTableView, filters: ArCabildoabiertoEmbedVisualization.Main["filters"] | null, sortingBy: DatasetSortOrder | null, searchValue?: string, rowsToShow?: number) {
        super(spec, dataset, filters ?? undefined)
        this.sortingBy = sortingBy
        this.searchValue = searchValue
        this.rowsToShow = rowsToShow
        if (ArCabildoabiertoEmbedVisualization.isTable(this.spec) && this.spec.columns) {
            this.columnsMap = new Map(
                Array.from(this.spec.columns.map(c => ([c.columnName, c])))
            )
        }
        if(!this.searchValue && !this.sortingBy && this.rowsToShow != null) {
            this.data = this.data.slice(0, this.rowsToShow)
        }
    }

    prepareForPlot(prev?: TablePlotter) {
        super.prepareForPlot(prev)

        if (prev) {
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
            this.dataForPlot = this.data.filter(((row, index) => {
                return this.strRows[index].some(x => x.includes(searchKey))
            }))
        }
        if (this.sortingBy) {
            const col = this.sortingBy.col
            this.dataForPlot = this.dataForPlot.toSorted((a, b) => {
                return (this.sortingBy.order == "desc" ? -1 : 1) * this.cmpValues(col, a[col], b[col])
            })
        }
        return {}
    }

    columnValueToString(value: any, col: string): string {
        const type = this.columnTypes.get(col)
        const parsed = this.parser.parseValue(value, type)
        if (parsed.success) {
            const column = this.columnsMap.get(col)
            return this.valueToString(parsed.value, parsed.dataType, column?.precision)
        } else if (value == undefined) {
            return "null"
        } else if (typeof value == "string" && value.trim().length == 0) {
            return "null"
        } else {
            return `Valor inválido: ${value instanceof Array}.`
        }
    }

    cmpValues(col: string, a: any, b: any) {
        const type = this.columnTypes.get(col)
        if (type == "string") {
            return (a as string) >= b ? 1 : -1
        } else if (type == "number") {
            return Number(a) >= Number(b) ? 1 : -1
        } else if (type == "date") {
            return new Date(a) >= new Date(b) ? 1 : -1
        } else if (type == "string[]") {
            return 0
        }
    }

    isEmpty(): boolean {
        return this.data.length == 0
    }

    getKeysToHeadersMap(): [string, string][] {
        const res: [string, string][] = []

        if (ArCabildoabiertoEmbedVisualization.isTable(this.spec)) {
            const config = this.spec.columns
            if (config && config.length > 0) {
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