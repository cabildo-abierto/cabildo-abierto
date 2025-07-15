import {
    Column,
    DatasetView,
    isTopicsDatasetView,
    TopicsDatasetView
} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {useMemo, useState} from "react";
import {TablePlotter} from "@/components/visualizations/editor/plotter";
import SearchBar from "@/components/buscar/search-bar";
import {Table} from "@/lex-api/types/ar/cabildoabierto/embed/visualization";
import {topicUrl} from "@/utils/uri";
import Link from "next/link";


export type RawDatasetView = {
    data: string
    columns: Column[]
}


export type DatasetForTableView = Omit<DatasetView | TopicsDatasetView | RawDatasetView, "name" | "uri" | "cid" | "author" | "createdAt">


type DatasetTableViewProps = {
    dataset: DatasetForTableView
    maxHeight?: number
    maxWidth?: number
    columnsConfig?: Table["columns"]
    sort?: boolean
}


const TableRow = ({values, plotter, columns, href}: {
    values: [string, any][], dataset: DatasetForTableView, plotter: TablePlotter, columns: Column[], href?: string
}) => {
    return values.map(([col, value], colIndex) => {
        if (columns.some(c => col == c.name)) {
            const content = plotter.columnValueToString(value, col)

            if (href) {
                return <td className="border-none text-[var(--text-light)] exclude-links px-4 py-2" onClick={() => {
                    window.open(href, "_blank")
                }} key={colIndex}>
                    <Link
                        href={href}
                        target="_blank"
                        className={""}
                    >
                        {content}
                    </Link>
                </td>
            } else {
                return <td className="border-none px-4 py-2" key={colIndex}>
                    {content}
                </td>
            }
        }
    })
}


export const DatasetTableView = ({sort=true, dataset, maxHeight, maxWidth, columnsConfig}: DatasetTableViewProps) => {
    const [showingRowsCount, setShowingRowsCount] = useState(20)
    const [searchValue, setSearchValue] = useState("")

    const plotter = useMemo(() => {
        const plotter = new TablePlotter({
            $type: "ar.cabildoabierto.embed.visualization#table"
        }, dataset, sort, searchValue)
        plotter.prepareForPlot()
        return plotter
    }, [dataset])

    const empty = plotter.isEmpty()

    if (empty) return (
        <div className={"text-[var(--text-light)]"}>
            El conjunto de datos está vacío.
        </div>
    )

    return <div
        className={"border rounded-lg mb-4 custom-scrollbar overflow-scroll text-sm grow"}
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
                {plotter.columns.map((header, colIndex) => {
                    let name = header.name
                    const index = columnsConfig ? columnsConfig.findIndex(c => c.columnName == header.name) : -1
                    if (index != -1) {
                        const alias = columnsConfig[index].alias
                        if (alias) name = alias
                    }

                    return <th key={colIndex} className="px-4 py-2 text-left">
                        {name}
                    </th>
                })}
            </tr>
            </thead>
            <tbody>
            {plotter && plotter.dataForPlot.slice(0, showingRowsCount).map((r, rowIndex) => {
                let href: string = undefined

                const values = Object.entries(r)
                if (isTopicsDatasetView(dataset)) {
                    const tema = values.find(([k, v]) => k == "Tema")
                    href = topicUrl(tema[1])
                }

                return <tr
                    key={rowIndex}
                    className={"even:bg-[var(--background-ldark)] " + (href ? " hover:bg-[var(--background-dark)] cursor-pointer" : "")}
                >
                    <TableRow values={values} href={href} columns={plotter.columns} plotter={plotter} dataset={dataset}/>
                </tr>
            })}
            </tbody>
        </table>
        {showingRowsCount < plotter.dataForPlot.length && <div className={"text-base text-[var(--text-light)] py-2 ml-1"}>
            Se muestran las primeras {showingRowsCount} filas. <button onClick={() => {
            setShowingRowsCount(showingRowsCount + 20)
        }} className={"text-[var(--primary)] hover:underline"}>Ver más</button>.
        </div>}
    </div>
}