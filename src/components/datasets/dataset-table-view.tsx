import {DatasetView, TopicsDatasetView} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {useMemo, useState} from "react";
import {TablePlotter} from "@/components/visualizations/editor/plotter";
import SearchBar from "@/components/buscar/search-bar";
import {cleanText} from "@/utils/strings";
import {Table} from "@/lex-api/types/ar/cabildoabierto/embed/visualization";


export type DatasetForTableView = Omit<DatasetView | TopicsDatasetView, "name" | "uri" | "cid" | "author" | "createdAt">


type DatasetTableViewProps = {
    dataset: DatasetForTableView
    maxHeight?: number
    maxWidth?: number
    columnsConfig?: Table["columns"]
}


const CellContent = ({content, col, plotter}: { content: any, col: string, plotter: TablePlotter }) => {
    return plotter.columnValueToString(content, col)
}


export const DatasetTableView = ({dataset, maxHeight, maxWidth, columnsConfig}: DatasetTableViewProps) => {
    const rows: Record<string, any>[] = JSON.parse(dataset.data)
    const columns = dataset.columns.filter(c => !columnsConfig || columnsConfig.length == 0 || columnsConfig.some(c2 => c2.columnName == c.name))
    const [showingRowsCount, setShowingRowsCount] = useState(20)
    const [searchValue, setSearchValue] = useState("")

    const plotter = useMemo(() => {
        const plotter = new TablePlotter(dataset.data, {
            $type: "ar.cabildoabierto.embed.visualization#table"
        })
        plotter.prepareForPlot()
        return plotter
    }, [dataset])

    if (rows.length == 0 || columns.length == 0) return <div className={"text-[var(--text-light)]"}>
        El conjunto de datos está vacío.
    </div>

    let filteredRows = rows
    if(searchValue != ""){
        const searchKey = cleanText(searchValue)
        filteredRows = rows.filter(row => {
            return Array.from(Object.entries(row)).some(([k, v]) => {
                return cleanText(plotter.columnValueToString(v, k)).includes(searchKey)
            })
        })
    }

    return <div
        className={"border rounded-lg mb-4 custom-scrollbar overflow-auto text-sm grow"}
        style={{maxHeight, maxWidth}}
    >
        <div className={"bg-[var(--background-dark)] flex justify-start rounded-t-lg"}>
            <div className={"w-64 p-1"}>
                <SearchBar
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    size={"small"}
                    paddingY={"6px"}
                    color={"background-dark2"}
                    borderColor={"background-dark3"}
                />
            </div>
        </div>
        <table className="table-auto w-full border-collapse max-[1080px]:text-xs">
            <thead className="bg-[var(--background-dark)]">
                <tr>
                    {columns.map((header, colIndex) => {
                        let name = header.name
                        const index = columnsConfig ? columnsConfig.findIndex(c => c.columnName == header.name) : -1
                        if(index != -1){
                            const alias = columnsConfig[index].alias
                            if(alias) name = alias
                        }

                        return <th key={colIndex} className="px-4 py-2 text-left">
                            {name}
                        </th>
                    })}
                </tr>
            </thead>
            <tbody>
            {filteredRows && filteredRows.slice(0, showingRowsCount).map((r, rowIndex) => (
                <tr key={rowIndex} className="even:bg-[var(--background-ldark)]">
                    {Object.entries(r as Record<string, any>).map(([col, value], colIndex) => {
                        if(columns.some(c => col == c.name)){
                            return <td key={colIndex} className=" border-none px-4 py-2">
                                <CellContent content={value} col={col} plotter={plotter}/>
                            </td>
                        }
                    })}
                </tr>
            ))}
            </tbody>
        </table>
        {showingRowsCount < filteredRows.length && <div className={"text-base text-[var(--text-light)] py-2 ml-1"}>
            Se muestran las primeras {showingRowsCount} filas. <button onClick={() => {
            setShowingRowsCount(showingRowsCount + 20)
        }} className={"text-[var(--primary)] hover:underline"}>Ver más</button>.
        </div>}
    </div>
}