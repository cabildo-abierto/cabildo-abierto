import {DatasetForTableView, DatasetSortOrder} from "@/components/visualizations/datasets/dataset-table-view";
import {ArCabildoabiertoEmbedVisualization} from "@/lex-api/index"
import {cleanText} from "@/utils/strings";
import {DataRow, Plotter} from "@/components/visualizations/editor/plotter/plotter";

export class TablePlotter extends Plotter {
    private sortingBy: DatasetSortOrder | null
    private searchValue: string
    public dataForPlot: DataRow[]
    public strRows: string[][]
    private columnsMap: Map<string, ArCabildoabiertoEmbedVisualization.TableVisualizationColumn> = new Map()

    constructor(spec: ArCabildoabiertoEmbedVisualization.Main["spec"], dataset: DatasetForTableView, filters: ArCabildoabiertoEmbedVisualization.Main["filters"] | null, sortingBy: DatasetSortOrder | null, searchValue?: string) {
        super(spec, dataset, filters ?? undefined)
        this.sortingBy = sortingBy
        this.searchValue = searchValue
        if (ArCabildoabiertoEmbedVisualization.isTable(this.spec) && this.spec.columns) {
            this.columnsMap = new Map(
                Array.from(this.spec.columns.map(c => ([c.columnName, c])))
            )
        }
    }

    prepareForPlot(prev?: TablePlotter) {
        //const t1 = Date.now()
        super.prepareForPlot(prev)
        //const t2 = Date.now()

        if (prev) {
            this.strRows = prev.strRows
        } else {
            this.strRows = this.data.map(r => {
                return Array.from(Object.entries(r)).map(([key, value]) => {
                    return cleanText(this.columnValueToString(value, key))
                })
            })
        }
        //const t3 = Date.now()
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
        //const t4 = Date.now()
        //logTimes("prepare for plot", [t1, t2, t3, t4])
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