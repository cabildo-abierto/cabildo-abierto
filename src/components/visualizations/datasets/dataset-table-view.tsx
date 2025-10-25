import {ArCabildoabiertoDataDataset, ArCabildoabiertoEmbedVisualization} from "@/lex-api"
import {useEffect, useMemo, useRef, useState} from "react";
import SearchBar from "@/components/buscar/search-bar";
import {topicUrl} from "@/utils/uri";
import Link from "next/link";
import {CaretDownIcon, CaretUpIcon} from "@phosphor-icons/react";
import {TablePlotter} from "@/components/visualizations/editor/plotter/table-plotter";
import {useDebounce} from "@/utils/debounce";


export type RawDatasetView = {
    data: string
    columns: ArCabildoabiertoDataDataset.Column[]
}


export type DatasetForTableView = Omit<ArCabildoabiertoDataDataset.DatasetView | ArCabildoabiertoDataDataset.TopicsDatasetView | RawDatasetView, "name" | "uri" | "cid" | "author" | "createdAt">


type DatasetTableViewProps = {
    dataset: DatasetForTableView
    maxHeight?: number
    maxWidth?: number
    columnsConfig?: ArCabildoabiertoEmbedVisualization.Table["columns"]
    sort?: boolean
    filters?: ArCabildoabiertoEmbedVisualization.Main["filters"]
}


const TableRow = ({values, plotter, columns, href}: {
    values: [string, any][]
    dataset: DatasetForTableView
    plotter: TablePlotter
    columns: [string, string][]
    href?: string
    columnsConfig?: ArCabildoabiertoEmbedVisualization.Table["columns"]
}) => {
    return columns.map(([col, header], colIndex) => {
        const value = values.find(v => v[0] == col)
        if (value) {
            const content = plotter.columnValueToString(value[1], col)
            if (href) {
                return <td
                    className="overflow-hidden text-ellipsis whitespace-nowrap border-none text-[var(--text-light)] exclude-links px-4 py-2"
                    onClick={() => {
                        window.open(href, "_blank")
                    }}
                    key={colIndex}
                >
                    <Link
                        href={href}
                        target="_blank"
                        className={"line-clamp-2"}
                        title={content}
                    >
                        {content}
                    </Link>
                </td>
            } else {
                return <td
                    className="min-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap border-none px-4 py-2"
                    title={content}
                    key={colIndex}
                >
                    {content}
                </td>
            }
        } else {
            return <td
                key={colIndex}
                className="min-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap border-none px-4 py-2"
            />
        }
    })
}


export type DatasetSortOrder = { col: string, order: "asc" | "desc" }


export const DatasetTableView = ({
                                     sort = true,
                                     dataset,
                                     columnsConfig,
                                     maxHeight,
                                     maxWidth,
                                     filters
                                 }: DatasetTableViewProps) => {
    const [showingRowsCount, setShowingRowsCount] = useState(20)
    const [searchValue, setSearchValue] = useState("")
    const [sortingBy, setSortingBy] = useState<DatasetSortOrder | null>(null)
    const debouncedSearchValue = useDebounce(searchValue, 100)
    const plotterRef = useRef<TablePlotter | null>(null)

    const plotter = useMemo(() => {
        const prev = plotterRef.current
        const plotter = new TablePlotter(
            {
                $type: "ar.cabildoabierto.embed.visualization#table",
                columns: columnsConfig
            },
            dataset,
            filters,
            sortingBy,
            searchValue
        )
        plotter.prepareForPlot(prev)
        plotterRef.current = plotter
        return plotter
    }, [dataset, sortingBy, debouncedSearchValue])

    const columns = plotter.getKeysToHeadersMap()

    useEffect(() => {
        if (!sortingBy && sort && columns && columns.length > 0 && columns[0].length > 0) {
            setSortingBy({
                col: columns[0][0],
                order: "desc"
            })
        }
    }, [sortingBy, sort])

    const empty = plotter.isEmpty()

    if (empty) return (
        <div className={"text-[var(--text-light)]"}>
            El conjunto de datos está vacío.
        </div>
    )

    return <div
        className={"border border-[var(--accent-dark)] mb-4 custom-scrollbar overflow-x-auto overflow-y-auto text-sm grow "}
        style={{maxHeight, maxWidth}}
    >
        <div className={"flex justify-start"}>
            <div className={"w-64 p-1"}>
                <SearchBar
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    size={"small"}
                    paddingY={"4px"}
                    paddingX={"8px"}
                    color={"background"}
                    borderColor={"accent-dark"}
                />
            </div>
        </div>
        <table className="table-auto w-full border-collapse max-[1080px]:text-xs">
            <thead className="bg-[var(--background-dark)] border-b border-t border-[var(--accent-dark)]">
            <tr className={""}>
                {columns.map(([col, header], colIndex) => {

                    function onClick() {
                        if (sortingBy && sortingBy.col == col) {
                            setSortingBy({
                                col,
                                order: sortingBy.order == "desc" ? "asc" : "desc"
                            })
                        } else {
                            setSortingBy({
                                col,
                                order: "desc"
                            })
                        }
                    }

                    return <th key={colIndex} className="text-left px-4 py-2 cursor-pointer" onClick={onClick}>
                        <div className="inline-flex items-center gap-1">
                            <span>{header}</span>
                            {sortingBy && sortingBy.col == col && (
                                <span className="inline-block">
                                    {sortingBy.order == "desc" ? <CaretDownIcon/> : <CaretUpIcon/>}
                                </span>
                            )}
                        </div>
                    </th>
                })}
            </tr>
            </thead>
            <tbody>
            {plotter && plotter.dataForPlot.slice(0, showingRowsCount).map((r, rowIndex) => {
                let href: string = undefined

                const values = Object.entries(r)
                if (ArCabildoabiertoDataDataset.isTopicsDatasetView(dataset)) {
                    const tema = values.find(([k, v]) => k == "Tema")
                    href = topicUrl(tema[1])
                }

                return <tr
                    key={rowIndex}
                    className={"even:bg-[var(--background-dark)] " + (href ? " hover:bg-[var(--background-dark2)] cursor-pointer" : "")}
                >
                    <TableRow
                        values={values}
                        href={href}
                        columns={columns}
                        plotter={plotter}
                        dataset={dataset}
                    />
                </tr>
            })}
            </tbody>
        </table>
        {plotter && plotter.dataForPlot.length == 0 &&
            <div className={"text-center text-sm font-light text-[var(--text-light)] w-full py-16"}>
                {searchValue == "" ? "Sin datos." : "Sin resultados."}
            </div>}
        {showingRowsCount < plotter.dataForPlot.length &&
            <div className={"text-sm pl-2 text-[var(--text-light)] py-2"}>
                Se muestran las primeras {showingRowsCount} filas. <button onClick={() => {
                setShowingRowsCount(showingRowsCount + 20)
            }} className={"text-[var(--text-light)] underline hover:text-[var(--text)]"}>Ver más</button>.
            </div>}
    </div>
}